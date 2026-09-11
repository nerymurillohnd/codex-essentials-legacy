#!/usr/bin/env python3
"""Validate Prompt Architect final-output structure from a Codex hook payload."""

from __future__ import annotations

import collections
import contextlib
import itertools
import json
import re
import sys
import typing

SECTION_NAMES = (
    "Result",
    "Assumptions",
    "Clarification Questions",
    "Final Prompt",
    "Execution Recommendation",
    "Current Guidance Notes",
    "Optional Improvements",
)
SECTION_BY_LOWER = dict(zip(map(str.lower, SECTION_NAMES), SECTION_NAMES, strict=True))
RECOMMENDATION_TOKENS = ("model", "reasoning", "P-level", "D-level", "R-level")
READY_SECTIONS = ("Result", "Assumptions", "Final Prompt", "Execution Recommendation")
CLARIFICATION_SECTIONS = ("Result", "Assumptions", "Clarification Questions")
FINAL_PROMPT_NOT_ALLOWED = "Needs Clarification output must omit Final Prompt"
HEADING_PATTERN = re.compile(
    r"""
    ^[ \t]*\*\*
    (
        Result|Assumptions|Clarification[ ]Questions|Final[ ]Prompt|
        Execution[ ]Recommendation|Current[ ]Guidance[ ]Notes|Optional[ ]Improvements
    )
    \*\*
    """,
    re.IGNORECASE | re.MULTILINE | re.VERBOSE,
)
RESULT_PATTERN = re.compile(
    r"(?im)^\s*\*\*Result\*\*\s*(?:-|\u2014|:)?\s*(Ready|Needs Clarification)\b",
)
GATE_EVIDENCE_PATTERN = re.compile(
    r"""
    Gate[ ]Evidence:\s*intake=pass;\s*
    classification=R[0-3]/D[0-5]/P[0-3];\s*
    references=pass;\s*placement=pass;\s*template=pass;\s*
    output=pass;\s*self-audit=pass
    """,
    re.IGNORECASE | re.VERBOSE,
)


type SectionIndex = dict[str, list[re.Match[str]]]


def _build_section_index(text: str) -> SectionIndex:
    index: SectionIndex = {name: [] for name in SECTION_NAMES}

    def record(match: re.Match[str]) -> None:
        index[SECTION_BY_LOWER[match.group(1).lower()]].append(match)

    _ = collections.deque(map(record, HEADING_PATTERN.finditer(text)), maxlen=0)
    return index


def _first_section(index: SectionIndex, name: str) -> re.Match[str] | None:
    with contextlib.suppress(IndexError):
        return index[name][0]
    return None


def _last_section(index: SectionIndex, name: str) -> re.Match[str] | None:
    with contextlib.suppress(IndexError):
        return index[name][-1]
    return None


def _emit(system_message: str) -> None:
    print(system_message, file=sys.stderr)


def _collect_strings(value: object) -> list[str]:
    match value:
        case str():
            return [value]
        case list():
            return [
                text
                for item in typing.cast("list[object]", value)
                for text in _collect_strings(item)
            ]
        case dict():
            return [
                text
                for item in typing.cast("dict[object, object]", value).values()
                for text in _collect_strings(item)
            ]
        case _:
            return []


def _collect_hook_text(raw_input: str) -> str:
    match raw_input.strip():
        case "":
            return ""
        case _:
            pass
    try:
        parsed = typing.cast("object", json.loads(raw_input))
    except json.JSONDecodeError:
        return raw_input
    return "\n".join(_collect_strings(parsed))


def _result_state(text: str) -> str | None:
    match RESULT_PATTERN.search(text):
        case None:
            return None
        case result:
            return result.group(1).lower()


def _is_prompt_architect_output(index: SectionIndex, state: str | None) -> bool:
    return all(
        (
            bool(index["Result"]),
            bool(index["Assumptions"]),
            any((state is not None, any(map(bool, map(index.get, SECTION_NAMES[2:]))))),
        )
    )


def _required_sections(
    index: SectionIndex,
    names: tuple[str, ...],
) -> list[str]:
    return [f"missing {name}" for name in names if not index[name]]


def _is_ordered(matches: tuple[re.Match[str] | None, ...]) -> bool:
    present = tuple(filter(lambda match: match is not None, matches))
    ordered = all(
        current.start() < following.start()
        for current, following in itertools.pairwise(
            typing.cast("tuple[re.Match[str], ...]", present)
        )
    )
    return len(present) == len(matches) and ordered


def _ready_sections(
    index: SectionIndex,
    assumptions: re.Match[str],
    final_prompt: re.Match[str],
    execution: re.Match[str],
) -> tuple[re.Match[str] | None, ...]:
    """Return the required Ready sections in their required order."""
    return (_first_section(index, "Result"), assumptions, final_prompt, execution)


def _recommendation_errors(recommendation: str) -> list[str]:
    return [
        f"Execution Recommendation missing {token}"
        for token in RECOMMENDATION_TOKENS
        if re.search(re.escape(token), recommendation, re.IGNORECASE) is None
    ]


def _has_heading_between(
    index: SectionIndex,
    name: str,
    start: int,
    end: int,
) -> bool:
    return any(start <= match.start() < end for match in index[name])


def _validate_ready(text: str, index: SectionIndex) -> list[str]:
    errors = _required_sections(index, READY_SECTIONS)
    match errors:
        case []:
            pass
        case _:
            return errors

    assumptions = typing.cast("re.Match[str]", _first_section(index, "Assumptions"))
    final_prompt = typing.cast("re.Match[str]", _first_section(index, "Final Prompt"))
    execution_match = _last_section(index, "Execution Recommendation")
    execution = typing.cast("re.Match[str]", execution_match)
    recommendation = text[execution.end() :]
    ready_order = _ready_sections(index, assumptions, final_prompt, execution)
    if not _is_ordered(ready_order):
        errors.append("required Ready sections are out of order")
    errors.extend(
        ["Ready output must omit Clarification Questions"]
        * _has_heading_between(
            index,
            "Clarification Questions",
            assumptions.end(),
            final_prompt.start(),
        )
    )
    errors.extend(_recommendation_errors(recommendation))
    errors.extend(
        ["missing compact Gate Evidence pass line"]
        * (GATE_EVIDENCE_PATTERN.search(recommendation) is None)
    )
    return errors


def _validate_needs_clarification(index: SectionIndex) -> list[str]:
    errors = _required_sections(index, CLARIFICATION_SECTIONS)
    match errors:
        case []:
            pass
        case _:
            return errors

    errors.extend(
        ["Needs Clarification sections are out of order"]
        * (
            not _is_ordered(
                (
                    _first_section(index, "Result"),
                    _first_section(index, "Assumptions"),
                    _first_section(index, "Clarification Questions"),
                )
            )
        )
    )
    missing_prompt = bool(index["Final Prompt"])
    errors.extend([FINAL_PROMPT_NOT_ALLOWED] * missing_prompt)
    errors.extend(
        ["Needs Clarification output must omit Execution Recommendation"]
        * bool(index["Execution Recommendation"])
    )
    return errors


def _validate_prompt_architect_output(text: str) -> list[str]:
    index = _build_section_index(text)
    state = _result_state(text)
    match (_is_prompt_architect_output(index, state), state):
        case (False, _):
            return []
        case (True, "ready"):
            return _validate_ready(text, index)
        case (True, "needs clarification"):
            return _validate_needs_clarification(index)
        case _:
            return ["Result must be Ready or Needs Clarification"]


def _main() -> int:
    text = _collect_hook_text(sys.stdin.read())
    errors = _validate_prompt_architect_output(text)
    if not errors:
        return 0
    prefix = "prompt-architect-final-check: blocked; revise before delivery: "
    _emit(prefix + "; ".join(errors) + ".")
    return 2


if __name__ == "__main__":
    raise SystemExit(_main())
