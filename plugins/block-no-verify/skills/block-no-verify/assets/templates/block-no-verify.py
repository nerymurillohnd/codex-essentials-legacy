"""Deny Git verification and signing bypasses from Codex Bash tool calls.

This template is intentionally stdlib-only and fails closed when it cannot
parse the hook payload or the shell command. It inspects literal command text;
it does not evaluate variables, aliases, eval, or external scripts.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import NoReturn, cast

sys.dont_write_bytecode = True

ASSIGNMENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")
FALSE_VALUES = frozenset({"false", "no", "off", "0"})
WRAPPERS = frozenset(
    {
        "sudo",
        "env",
        "nice",
        "nohup",
        "timeout",
        "xargs",
        "command",
        "builtin",
        "noglob",
        "watch",
    }
)
VALUE_OPTIONS = frozenset({"-m", "--message"})
UNTERMINATED_SHELL = "unterminated shell escape or quote"


def deny(reason: str) -> NoReturn:
    """Emit the Codex deny response and end this hook invocation."""
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        },
        sys.stdout,
    )
    _ = sys.stdout.write("\n")
    raise SystemExit(0)


def split_subcommands(command: str) -> list[str]:
    """Split top-level shell command lists without evaluating shell syntax."""
    parts: list[str] = []
    current: list[str] = []
    quote: str | None = None
    escaped = False
    index = 0

    while index < len(command):
        character = command[index]
        if escaped:
            current.append(character)
            escaped = False
            index += 1
            continue
        if character == "\\" and quote != "'":
            current.append(character)
            escaped = True
            index += 1
            continue
        if quote is not None:
            current.append(character)
            if character == quote:
                quote = None
            index += 1
            continue
        if character in {"'", '"'}:
            quote = character
            current.append(character)
            index += 1
            continue
        if character in {";", "|", "\n"}:
            parts.append("".join(current))
            current = []
            if (
                character == "|"
                and index + 1 < len(command)
                and command[index + 1] == "|"
            ):
                index += 1
            index += 1
            continue
        if character == "&" and index + 1 < len(command) and command[index + 1] == "&":
            parts.append("".join(current))
            current = []
            index += 2
            continue
        current.append(character)
        index += 1

    if escaped or quote is not None:
        raise ValueError(UNTERMINATED_SHELL)
    parts.append("".join(current))
    return parts


def lex_words(command: str) -> list[str]:
    """Return literal shell words while preserving the no-evaluation boundary."""
    words: list[str] = []
    current: list[str] = []
    quote: str | None = None
    escaped = False

    for character in command:
        if escaped:
            current.append(character)
            escaped = False
            continue
        if character == "\\" and quote != "'":
            escaped = True
            continue
        if quote is not None:
            if character == quote:
                quote = None
            else:
                current.append(character)
            continue
        if character in {"'", '"'}:
            quote = character
            continue
        if character.isspace():
            if current:
                words.append("".join(current))
                current = []
            continue
        current.append(character)

    if escaped or quote is not None:
        raise ValueError(UNTERMINATED_SHELL)
    if current:
        words.append("".join(current))
    return words


def wrapper_option_uses_value(wrapper: str, option: str) -> bool:
    """Return whether a supported wrapper option consumes a following word."""
    return option in {
        "-c",
        "-g",
        "-k",
        "-n",
        "-p",
        "-s",
        "-u",
        "--command",
        "--interval",
        "--kill-after",
        "--signal",
        "--user",
    } or (wrapper == "watch" and option == "-n")


def strip_wrapper(words: list[str], start: int) -> int:
    """Return the word position after one supported command wrapper."""
    wrapper = Path(words[start]).name.casefold()
    index = start + 1
    while index < len(words) and words[index].startswith("-"):
        option = words[index].casefold()
        index += 1
        if wrapper_option_uses_value(wrapper, option) and index < len(words):
            index += 1
    if wrapper == "timeout" and index < len(words):
        index += 1
    if wrapper == "env":
        while index < len(words) and ASSIGNMENT.match(words[index]):
            index += 1
    return index


def strip_prefix(words: list[str]) -> list[str]:
    """Remove leading assignments and supported wrappers from a command."""
    index = 0
    while index < len(words):
        while index < len(words) and ASSIGNMENT.match(words[index]):
            index += 1
        if index == len(words) or Path(words[index]).name.casefold() not in WRAPPERS:
            break
        index = strip_wrapper(words, index)
    return words[index:]


def is_falsy_gpgsign(value: str) -> bool:
    """Return whether a Git configuration value disables commit signing."""
    key, separator, configured_value = value.partition("=")
    return (
        separator == "="
        and key.casefold() == "commit.gpgsign"
        and configured_value.casefold() in FALSE_VALUES
    )


def contains_bypass(words: list[str]) -> bool:
    """Return whether a literal Git invocation contains a prohibited bypass."""
    index = 1
    while index < len(words):
        word = words[index]
        lowered = word.casefold()
        if lowered in VALUE_OPTIONS:
            index += 2
            continue
        if lowered.startswith("-m") and lowered != "-m":
            index += 1
            continue
        if lowered.startswith("--message="):
            index += 1
            continue
        if lowered in {"--no-verify", "--no-gpg-sign"}:
            return True
        if lowered in {"-c", "--config"}:
            if index + 1 < len(words) and is_falsy_gpgsign(words[index + 1]):
                return True
            index += 2
            continue
        if lowered.startswith("-c") and is_falsy_gpgsign(word[2:]):
            return True
        if lowered.startswith("--config=") and is_falsy_gpgsign(word.split("=", 1)[1]):
            return True
        index += 1
    return False


def check_command(command: str) -> None:
    """Deny every supported Git bypass found in a command list."""
    for part in split_subcommands(command):
        words = strip_prefix(lex_words(part))
        if not words or Path(words[0]).name.casefold() != "git":
            continue
        if contains_bypass(words):
            reason = (
                "BLOCKED: Git verification and signing bypass flags are not allowed. "
                "Run the command without bypass flags so normal protections execute."
            )
            deny(reason)


def main() -> int:
    """Parse one Codex hook payload and inspect its optional Bash command."""
    try:
        parsed = cast("object", json.load(sys.stdin))
    except Exception as exc:  # noqa: BLE001 - fail closed by policy
        deny(f"block-no-verify.py could not parse its input: {exc}")

    if not isinstance(parsed, dict):
        deny("block-no-verify.py received a non-object payload.")
    payload: dict[str, object] = cast("dict[str, object]", parsed)
    raw_input = payload.get("tool_input")
    if not isinstance(raw_input, dict):
        return 0
    tool_input: dict[str, object] = cast("dict[str, object]", raw_input)
    command = tool_input.get("command")
    if not isinstance(command, str):
        return 0

    try:
        check_command(command)
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001 - fail closed by policy
        deny(f"block-no-verify.py could not inspect this command: {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
