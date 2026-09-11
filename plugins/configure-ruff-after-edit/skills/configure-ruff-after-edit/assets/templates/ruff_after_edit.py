#!/usr/bin/env python3
"""Run safe Ruff hygiene for Python files directly reported by one edit event."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

TIMEOUT_SECONDS = 30
PATCH_PATH = re.compile(r"^\*\*\* (?:Add|Update) File: (.+)$", re.MULTILINE)
DIRECT_PATH_KEYS = ("path", "file_path", "filename")


def status(message: str) -> None:
    print(f"ruff-after-edit: {message}")


def command_succeeds(command: list[str], cwd: Path) -> bool:
    try:
        return (
            subprocess.run(
                command,
                cwd=cwd,
                check=False,
                capture_output=True,
                text=True,
                timeout=TIMEOUT_SECONDS,
            ).returncode
            == 0
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def resolve_ruff(cwd: Path) -> list[str] | None:
    if (cwd / "uv.lock").is_file() and command_succeeds(
        ["uv", "run", "ruff", "--version"], cwd
    ):
        return ["uv", "run", "ruff"]

    for candidate in (
        cwd / ".venv" / "bin" / "ruff",
        cwd / ".venv" / "Scripts" / "ruff.exe",
    ):
        if candidate.is_file() and os.access(candidate, os.X_OK):
            command = [str(candidate)]
            if command_succeeds([*command, "--version"], cwd):
                return command

    path_ruff = shutil.which("ruff")
    if path_ruff and command_succeeds([path_ruff, "--version"], cwd):
        return [path_ruff]
    return None


def direct_paths(payload: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for source in (payload, payload.get("tool_input")):
        if not isinstance(source, dict):
            continue
        for key in DIRECT_PATH_KEYS:
            value = source.get(key)
            if isinstance(value, str):
                values.append(value)
        files = source.get("files")
        if isinstance(files, list):
            for item in files:
                if isinstance(item, str):
                    values.append(item)
                elif isinstance(item, dict):
                    for key in DIRECT_PATH_KEYS:
                        value = item.get(key)
                        if isinstance(value, str):
                            values.append(value)
                            break

    if payload.get("tool_name") == "apply_patch":
        tool_input = payload.get("tool_input")
        if isinstance(tool_input, dict):
            patch = tool_input.get("patch")
            if isinstance(patch, str):
                values.extend(PATCH_PATH.findall(patch))
    return values


def eligible_paths(payload: dict[str, Any], cwd: Path) -> list[Path]:
    accepted: list[Path] = []
    seen: set[Path] = set()
    for raw_path in direct_paths(payload):
        candidate = Path(raw_path)
        if not candidate.is_absolute():
            candidate = cwd / candidate
        if candidate.is_symlink() or candidate.suffix != ".py":
            continue
        try:
            resolved = candidate.resolve(strict=True)
            resolved.relative_to(cwd)
        except (OSError, ValueError):
            continue
        if not resolved.is_file() or resolved in seen:
            continue
        seen.add(resolved)
        accepted.append(resolved)
    return accepted


def run_ruff(command: list[str], path: Path, cwd: Path) -> bool:
    for arguments in (
        ["check", "--fix", "--no-unsafe-fixes", str(path)],
        ["format", str(path)],
        ["check", str(path)],
    ):
        try:
            result = subprocess.run(
                [*command, *arguments],
                cwd=cwd,
                check=False,
                capture_output=True,
                text=True,
                timeout=TIMEOUT_SECONDS,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            status(f"Ruff unavailable or timed out for {path.name}")
            return False
        if result.returncode:
            status(
                f"Ruff {' '.join(arguments[:1])} reported diagnostics for {path.name}"
            )
            return False
    status(f"processed {path.name}")
    return True


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        status("ignored malformed event")
        return 0
    if not isinstance(payload, dict) or payload.get("hook_event_name") != "PostToolUse":
        status("ignored non-PostToolUse event")
        return 0

    raw_cwd = payload.get("cwd")
    if not isinstance(raw_cwd, str):
        status("ignored event without a working directory")
        return 0
    try:
        cwd = Path(raw_cwd).resolve(strict=True)
    except OSError:
        status("ignored event with an unavailable working directory")
        return 0

    paths = eligible_paths(payload, cwd)
    if not paths:
        status("no reported Python files to process")
        return 0
    command = resolve_ruff(cwd)
    if command is None:
        status("no existing Ruff command available")
        return 0
    for path in paths:
        run_ruff(command, path, cwd)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
