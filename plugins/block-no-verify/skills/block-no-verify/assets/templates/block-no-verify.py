"""Deny Git verification and signing bypasses from Codex Bash tool calls.

This template is intentionally stdlib-only and fails closed when it cannot
parse the hook payload or the shell command. It inspects literal command text;
it does not evaluate variables, aliases, eval, or external scripts.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
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


def separator_end(command: str, index: int) -> int | None:
    """Return the end index for a top-level shell list separator."""
    character = command[index]
    if character in {";", "\n"}:
        return index + 1
    if character == "|":
        return index + 2 if command[index + 1 : index + 2] == "|" else index + 1
    if character == "&" and command[index + 1 : index + 2] == "&":
        return index + 2
    return None


def append_split_character(
    current: list[str],
    character: str,
    quote: str,
) -> str | None:
    """Append one quoted shell character and return the next quote state."""
    current.append(character)
    return None if character == quote else quote


def starts_shell_escape(character: str, quote: str | None) -> bool:
    """Return whether a backslash escapes the next shell character."""
    return character == "\\" and quote != "'"


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
        if starts_shell_escape(character, quote):
            current.append(character)
            escaped = True
            index += 1
            continue
        if quote is not None:
            quote = append_split_character(current, character, quote)
            index += 1
            continue
        if character in {"'", '"'}:
            quote = character
            current.append(character)
            index += 1
            continue
        separator = separator_end(command, index)
        if separator is not None:
            parts.append("".join(current))
            current = []
            index = separator
            continue
        current.append(character)
        index += 1

    if escaped or quote is not None:
        raise ValueError(UNTERMINATED_SHELL)
    parts.append("".join(current))
    return parts


def append_quoted_character(
    current: list[str],
    character: str,
    quote: str,
) -> str | None:
    """Append one quoted character and return the next quote state."""
    if character == quote:
        return None
    current.append(character)
    return quote


def flush_word(words: list[str], current: list[str]) -> list[str]:
    """Append one complete word when the lexer has buffered content."""
    if current:
        words.append("".join(current))
    return []


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
        if starts_shell_escape(character, quote):
            escaped = True
            continue
        if quote is not None:
            quote = append_quoted_character(current, character, quote)
            continue
        if character in {"'", '"'}:
            quote = character
            continue
        if character.isspace():
            current = flush_word(words, current)
            continue
        current.append(character)

    validate_terminated_shell((escaped, quote))
    _ = flush_word(words, current)
    return words


def validate_terminated_shell(state: tuple[bool, str | None]) -> None:
    """Reject an incomplete shell escape or quote sequence."""
    escaped, quote = state
    if escaped or quote is not None:
        raise ValueError(UNTERMINATED_SHELL)


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
    wrapper = pathlib.Path(words[start]).name.casefold()
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


def is_supported_wrapper(words: list[str], index: int) -> bool:
    """Return whether a word at index names a supported command wrapper."""
    return index < len(words) and pathlib.Path(words[index]).name.casefold() in WRAPPERS


def strip_prefix(words: list[str]) -> list[str]:
    """Remove leading assignments and supported wrappers from a command."""
    index = 0
    while index < len(words):
        while index < len(words) and ASSIGNMENT.match(words[index]):
            index += 1
        if not is_supported_wrapper(words, index):
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


def message_option_end(index: int, lowered: str) -> int | None:
    """Return the next index when an option consumes or embeds a message."""
    if lowered in VALUE_OPTIONS:
        return index + 2
    if lowered.startswith("-m") and lowered != "-m":
        return index + 1
    if lowered.startswith("--message="):
        return index + 1
    return None


def config_bypass(
    words: list[str],
    index: int,
    word: str,
    lowered: str,
) -> tuple[bool, int]:
    """Return whether one Git configuration option disables commit signing."""
    if lowered in {"-c", "--config"}:
        has_bypass = index + 1 < len(words) and is_falsy_gpgsign(words[index + 1])
        return has_bypass, index + 2
    if lowered.startswith("-c"):
        return is_falsy_gpgsign(word[2:]), index + 1
    if lowered.startswith("--config="):
        return is_falsy_gpgsign(word.split("=", 1)[1]), index + 1
    return False, index + 1


def contains_bypass(words: list[str]) -> bool:
    """Return whether a literal Git invocation contains a prohibited bypass."""
    index = 1
    while index < len(words):
        word = words[index]
        lowered = word.casefold()
        message_end = message_option_end(index, lowered)
        if message_end is not None:
            index = message_end
            continue
        if lowered in {"--no-verify", "--no-gpg-sign"}:
            return True
        has_bypass, index = config_bypass(words, index, word, lowered)
        if has_bypass:
            return True
    return False


def check_command(command: str) -> None:
    """Deny every supported Git bypass found in a command list."""
    for part in split_subcommands(command):
        words = strip_prefix(lex_words(part))
        if not words or pathlib.Path(words[0]).name.casefold() != "git":
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
