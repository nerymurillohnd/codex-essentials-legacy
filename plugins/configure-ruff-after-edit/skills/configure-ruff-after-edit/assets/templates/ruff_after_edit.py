#!/usr/bin/env python3
"""Run safe Ruff hygiene for Python files directly reported by one edit event."""

from __future__ import annotations

import json
import os
import pathlib
import re
import shutil
import signal
import sys
import time
from typing import Any

TIMEOUT_SECONDS = 30
POLL_INTERVAL_SECONDS = 0.05
PATCH_PATH = re.compile(r"^\*\*\* (?:Add|Update) File: (.+)$", re.MULTILINE)
DIRECT_PATH_KEYS = ("path", "file_path", "filename")
Path = pathlib.Path


def _status(message: str) -> None:
    """Print a concise handler status message."""
    print(f"ruff-after-edit: {message}")


def _run_command(command: list[str], cwd: Path) -> int | None:
    """Run a trusted executable in cwd with a finite, terminating wait."""
    previous_directory = Path.cwd()
    try:
        os.chdir(cwd)
        process_id = os.posix_spawn(command[0], command, os.environ)
    except FileNotFoundError:
        return None
    finally:
        os.chdir(previous_directory)

    deadline = time.monotonic() + TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        completed_id, status = os.waitpid(process_id, os.WNOHANG)
        if completed_id:
            return os.waitstatus_to_exitcode(status)
        time.sleep(POLL_INTERVAL_SECONDS)
    os.kill(process_id, signal.SIGTERM)
    _, status = os.waitpid(process_id, 0)
    return os.waitstatus_to_exitcode(status)


def _command_succeeds(command: list[str], cwd: Path) -> bool:
    """Probe one verified executable without changing the target project."""
    return _run_command(command, cwd) == 0


def _resolve_ruff(cwd: Path) -> list[str] | None:
    """Return a verified project-local or PATH Ruff executable, if available."""
    for candidate in (
        cwd / ".venv" / "bin" / "ruff",
        cwd / ".venv" / "Scripts" / "ruff.exe",
    ):
        if candidate.is_file() and os.access(candidate, os.X_OK):
            command = [str(candidate)]
            if _command_succeeds([*command, "--version"], cwd):
                return command

    path_ruff = shutil.which("ruff")
    if path_ruff and _command_succeeds([path_ruff, "--version"], cwd):
        return [path_ruff]
    return None


def _path_values(source: object) -> list[str]:
    """Collect direct path fields from one documented event object."""
    if not isinstance(source, dict):
        return []
    # fmt: off
    return [
        value for key in DIRECT_PATH_KEYS if isinstance(value := source.get(key), str)
    ]
    # fmt: on


def _file_values(source: object) -> list[str]:
    """Collect direct paths from a documented event files list."""
    # fmt: off
    if not isinstance(source, dict) or not isinstance(
        files := source.get("files"), list
    ):
        # fmt: on
        return []
    values: list[str] = []
    for item in files:
        if isinstance(item, str):
            values.append(item)
        else:
            values.extend(_path_values(item))
    return values


def _patch_values(payload: dict[str, Any]) -> list[str]:
    """Collect Add and Update targets from a documented apply_patch command."""
    tool_input = payload.get("tool_input")
    if payload.get("tool_name") != "apply_patch" or not isinstance(tool_input, dict):
        return []
    command = tool_input.get("command")
    return PATCH_PATH.findall(command) if isinstance(command, str) else []


def _direct_paths(payload: dict[str, Any]) -> list[str]:
    """Collect only paths directly reported by the one hook event."""
    sources = (payload, payload.get("tool_input"))
    return [
        *[value for source in sources for value in _path_values(source)],
        *[value for source in sources for value in _file_values(source)],
        *_patch_values(payload),
    ]


def _has_symlink_component(candidate: Path, cwd: Path) -> bool:
    """Return whether an in-project lexical path crosses a symlink."""
    component = cwd
    # fmt: off
    return any(
        (component := component / part).is_symlink()
        for part in candidate.relative_to(cwd).parts
    )
    # fmt: on


def _eligible_paths(payload: dict[str, Any], cwd: Path) -> list[Path]:
    """Return deduplicated, existing regular Python files contained by cwd."""
    accepted: list[Path] = []
    seen: set[Path] = set()
    for raw_path in _direct_paths(payload):
        candidate = Path(raw_path)
        candidate = candidate if candidate.is_absolute() else cwd / candidate
        if candidate.suffix != ".py":
            continue
        try:
            candidate.relative_to(cwd)
            if _has_symlink_component(candidate, cwd):
                continue
            resolved = candidate.resolve(strict=True)
            resolved.relative_to(cwd)
        except OSError, ValueError:
            continue
        if resolved.is_file() and resolved not in seen:
            seen.add(resolved)
            accepted.append(resolved)
    return accepted


def _run_ruff(command: list[str], path: Path, cwd: Path) -> None:
    """Run safe fix, format, and final check for one eligible file."""
    commands = (
        ["check", "--fix", "--no-unsafe-fixes", str(path)],
        ["format", str(path)],
        ["check", str(path)],
    )
    for arguments in commands:
        try:
            result = _run_command([*command, *arguments], cwd)
        except OSError:
            _status(f"Ruff unavailable or timed out for {path.name}")
            return
        if result != 0:
            _status(f"Ruff {arguments[0]} reported diagnostics for {path.name}")
            return
    _status(f"processed {path.name}")


def _event_cwd(payload: dict[str, Any]) -> Path | None:
    """Return the existing event working directory, if present."""
    raw_cwd = payload.get("cwd")
    if not isinstance(raw_cwd, str):
        _status("ignored event without a working directory")
        return None
    try:
        return Path(raw_cwd).resolve(strict=True)
    except OSError:
        _status("ignored event with an unavailable working directory")
        return None


def main() -> int:
    """Process one PostToolUse payload and leave the completed edit intact."""
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError, OSError:
        _status("ignored malformed event")
        return 0
    if not isinstance(payload, dict) or payload.get("hook_event_name") != "PostToolUse":
        _status("ignored non-PostToolUse event")
        return 0
    cwd = _event_cwd(payload)
    if cwd is None:
        return 0
    paths = _eligible_paths(payload, cwd)
    if not paths:
        _status("no reported Python files to process")
        return 0
    command = _resolve_ruff(cwd)
    if command is None:
        _status("no existing Ruff command available")
        return 0
    for path in paths:
        _run_ruff(command, path, cwd)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
