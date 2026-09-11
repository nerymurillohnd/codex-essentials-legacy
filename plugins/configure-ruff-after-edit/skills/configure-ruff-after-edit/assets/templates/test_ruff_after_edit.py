#!/usr/bin/env python3
"""Maintenance tests for the copied Ruff after-edit handler template."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

TEMPLATE_DIRECTORY = Path(__file__).resolve().parent
HANDLER = TEMPLATE_DIRECTORY / "ruff_after_edit.py"


def write_fake_ruff(directory: Path, log: Path, *, unfixable: bool = False) -> None:
    script = directory / "ruff"
    script.write_text(
        f"#!{sys.executable}\n"
        "import os\n"
        "import sys\n"
        "from pathlib import Path\n"
        "arguments = sys.argv[1:]\n"
        "Path(os.environ['RUFF_LOG']).open('a').write(' '.join(arguments) + '\\n')\n"
        "if arguments == ['--version']:\n"
        "    raise SystemExit(0)\n"
        f"if {unfixable!r} and arguments[:1] == ['check'] and '--fix' not in arguments:\n"
        "    raise SystemExit(1)\n"
        "raise SystemExit(0)\n",
        encoding="utf8",
    )
    script.chmod(0o755)


def invoke(
    project: Path, payload: dict[str, object], path: str, log: Path
) -> subprocess.CompletedProcess[str]:
    environment = os.environ | {"PATH": path, "RUFF_LOG": str(log)}
    return subprocess.run(
        [sys.executable, str(HANDLER)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=project,
        env=environment,
        check=False,
        timeout=10,
    )


def payload(
    project: Path, tool_input: dict[str, object], *, tool_name: str = "Write"
) -> dict[str, object]:
    return {
        "hook_event_name": "PostToolUse",
        "cwd": str(project),
        "tool_name": tool_name,
        "tool_input": tool_input,
    }


def log_lines(log: Path) -> list[str]:
    return log.read_text(encoding="utf8").splitlines() if log.exists() else []


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run_scenario(scenario: str) -> list[str]:
    with tempfile.TemporaryDirectory() as temporary_directory:
        temporary = Path(temporary_directory)
        project = temporary / "project"
        project.mkdir()
        project = project.resolve()
        bin_directory = temporary / "bin"
        bin_directory.mkdir()
        bin_directory = bin_directory.resolve()
        log = temporary / "ruff.log"
        safe_file = project / "safe.py"
        safe_file.write_text("x = 1\n", encoding="utf8")
        second_file = project / "second.py"
        second_file.write_text("y = 2\n", encoding="utf8")
        unreported_file = project / "unreported.py"
        unreported_file.write_text("z = 3\n", encoding="utf8")
        text_file = project / "notes.txt"
        text_file.write_text("notes\n", encoding="utf8")
        outside_file = temporary / "outside.py"
        outside_file.write_text("outside = 1\n", encoding="utf8")
        environment_path = str(bin_directory)

        if scenario != "missing-ruff":
            write_fake_ruff(bin_directory, log, unfixable=scenario == "unfixable")
        if scenario == "safe-order":
            result = invoke(
                project, payload(project, {"path": "safe.py"}), environment_path, log
            )
            require(result.returncode == 0, result.stderr)
            expected = [
                "--version",
                f"check --fix --no-unsafe-fixes {safe_file}",
                f"format {safe_file}",
                f"check {safe_file}",
            ]
            require(
                log_lines(log) == expected, f"unexpected commands: {log_lines(log)}"
            )
        elif scenario == "multiple-files":
            result = invoke(
                project,
                payload(project, {"files": ["safe.py", "second.py", "safe.py"]}),
                environment_path,
                log,
            )
            require(result.returncode == 0, result.stderr)
            lines = log_lines(log)
            require(sum(str(unreported_file) in line for line in lines) == 0, lines)
            require(sum(str(safe_file) in line for line in lines) == 3, lines)
            require(sum(str(second_file) in line for line in lines) == 3, lines)
        elif scenario == "non-python":
            result = invoke(
                project, payload(project, {"path": "notes.txt"}), environment_path, log
            )
            require(result.returncode == 0, result.stderr)
            require(not log_lines(log), "Ruff ran for a non-Python file")
        elif scenario == "outside":
            result = invoke(
                project,
                payload(project, {"path": str(outside_file)}),
                environment_path,
                log,
            )
            require(result.returncode == 0, result.stderr)
            require(not log_lines(log), "Ruff ran for an outside path")
        elif scenario == "symlink":
            link = project / "linked.py"
            link.symlink_to(safe_file)
            result = invoke(
                project, payload(project, {"path": "linked.py"}), environment_path, log
            )
            require(result.returncode == 0, result.stderr)
            require(not log_lines(log), "Ruff ran for a symlink")
        elif scenario == "missing-ruff":
            result = invoke(
                project, payload(project, {"path": "safe.py"}), environment_path, log
            )
            require(result.returncode == 0, result.stderr)
            require("no existing Ruff command" in result.stdout, result.stdout)
        elif scenario == "unfixable":
            result = invoke(
                project, payload(project, {"path": "safe.py"}), environment_path, log
            )
            require(result.returncode == 0, result.stderr)
            require("reported diagnostics" in result.stdout, result.stdout)
            require(log_lines(log)[-1] == f"check {safe_file}", log_lines(log))
        else:
            raise ValueError(f"unknown scenario: {scenario}")
        return log_lines(log)


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: test_ruff_after_edit.py SCENARIO", file=sys.stderr)
        return 2
    for line in run_scenario(sys.argv[1]):
        print(line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
