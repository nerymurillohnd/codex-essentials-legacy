#!/usr/bin/env python3
"""Maintenance tests for the copied Ruff after-edit handler template."""

from __future__ import annotations

import collections.abc
import contextlib
import dataclasses
import importlib.util
import io
import json
import os
import pathlib
import sys
import tempfile
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import types

Path = pathlib.Path
TEMPLATE_DIRECTORY = Path(__file__).resolve().parent
HANDLER = TEMPLATE_DIRECTORY / "ruff_after_edit.py"
EXPECTED_FILE_COMMANDS = 3
SUCCESS = 0
USAGE_ERROR = 2
HANDLER_TIMEOUT_SECONDS = 10
Scenario = collections.abc.Callable[["ScenarioContext"], None]


class _UnknownScenarioError(ValueError):
    """Raised when the maintenance runner receives an unsupported scenario."""


class _HandlerLoadError(RuntimeError):
    """Raised when the copied handler cannot be loaded for maintenance tests."""


@dataclasses.dataclass(frozen=True)
class ScenarioContext:
    """Temporary project and fake executable paths for one scenario."""

    project: Path
    bin_directory: Path
    log: Path
    safe_file: Path
    second_file: Path
    unreported_file: Path
    outside_file: Path

    @property
    def path(self) -> str:
        """Return the controlled executable search path."""
        return str(self.bin_directory)


@dataclasses.dataclass(frozen=True)
class HandlerResult:
    """Observable result from one in-process handler invocation."""

    status: int
    stdout: str


def _write_fake_ruff(directory: Path, *, unfixable: bool = False) -> None:
    """Write an executable fake Ruff that records every invocation."""
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


def _write_fake_uv(directory: Path) -> None:
    """Write an executable fake uv that records unexpected executions."""
    script = directory / "uv"
    script.write_text(
        f"#!{sys.executable}\n"
        "import os\n"
        "import sys\n"
        "from pathlib import Path\n"
        "Path(os.environ['RUFF_LOG']).open('a').write('uv ' + ' '.join(sys.argv[1:]) + '\\n')\n"
        "raise SystemExit(0)\n",
        encoding="utf8",
    )
    script.chmod(0o755)


def _invoke(
    context: ScenarioContext, tool_input: dict[str, object], *, tool_name: str = "Write"
) -> HandlerResult:
    """Run the copied handler with one controlled PostToolUse payload."""
    payload = {
        "hook_event_name": "PostToolUse",
        "cwd": str(context.project),
        "tool_name": tool_name,
        "tool_input": tool_input,
    }
    handler = _load_handler()
    previous_stdin = sys.stdin
    previous_environment = os.environ.copy()
    output = io.StringIO()
    try:
        os.environ.update({"PATH": context.path, "RUFF_LOG": str(context.log)})
        sys.stdin = io.StringIO(json.dumps(payload))
        with contextlib.redirect_stdout(output):
            status = handler.main()
    finally:
        sys.stdin = previous_stdin
        os.environ.clear()
        os.environ.update(previous_environment)
    return HandlerResult(status=status, stdout=output.getvalue())


def _load_handler() -> types.ModuleType:
    """Load the copied handler template for an in-process maintenance test."""
    specification = importlib.util.spec_from_file_location("ruff_after_edit", HANDLER)
    if specification is None or specification.loader is None:
        raise _HandlerLoadError
    module = importlib.util.module_from_spec(specification)
    sys.modules[specification.name] = module
    specification.loader.exec_module(module)
    return module


def _log_lines(context: ScenarioContext) -> list[str]:
    """Return fake-executable command records, if any."""
    # fmt: off
    return (
        context.log.read_text(encoding="utf8").splitlines()
        if context.log.exists()
        else []
    )
    # fmt: on


def _assert_that(*, condition: bool, message: object) -> None:
    """Raise a concise test assertion failure."""
    if not condition:
        raise AssertionError(message)


def _assert_zero(result: HandlerResult) -> None:
    """Assert that a PostToolUse handler invocation remains non-blocking."""
    _assert_that(condition=result.status == SUCCESS, message=result.stdout)


def _assert_no_commands(context: ScenarioContext, message: str) -> None:
    """Assert that a rejected path did not invoke Ruff or uv."""
    _assert_that(condition=not _log_lines(context), message=message)


def _assert_file_commands(context: ScenarioContext, path: Path) -> None:
    """Assert that exactly one safe Ruff sequence targeted the requested file."""
    # fmt: off
    _assert_that(
        condition=sum(str(path) in line for line in _log_lines(context))
        == EXPECTED_FILE_COMMANDS,
        message=_log_lines(context),
    )
    # fmt: on


def _safe_order(context: ScenarioContext) -> None:
    """Assert safe fix, format, and final check order for one reported file."""
    result = _invoke(context, {"path": "safe.py"})
    _assert_zero(result)
    expected = [
        "--version",
        f"check --fix --no-unsafe-fixes {context.safe_file}",
        f"format {context.safe_file}",
        f"check {context.safe_file}",
    ]
    _assert_that(condition=_log_lines(context) == expected, message=_log_lines(context))


def _multiple_files(context: ScenarioContext) -> None:
    """Assert that duplicate reports do not reach unreported files or repeat work."""
    result = _invoke(context, {"files": ["safe.py", "second.py", "safe.py"]})
    _assert_zero(result)
    # fmt: off
    _assert_that(
        condition=all(
            str(context.unreported_file) not in line for line in _log_lines(context)
        ),
        message=_log_lines(context),
    )
    # fmt: on
    _assert_file_commands(context, context.safe_file)
    _assert_file_commands(context, context.second_file)


def _apply_patch(context: ScenarioContext) -> None:
    """Assert documented apply_patch Add and Update directives are processed."""
    added_file = context.project / "added.py"
    added_file.write_text("added = 1\n", encoding="utf8")
    result = _invoke(
        context,
        {"command": "*** Add File: added.py\n*** Update File: safe.py\n"},
        tool_name="apply_patch",
    )
    _assert_zero(result)
    _assert_file_commands(context, added_file)
    _assert_file_commands(context, context.safe_file)


def _non_python(context: ScenarioContext) -> None:
    """Assert that non-Python files are ignored without resolving Ruff."""
    result = _invoke(context, {"path": "notes.txt"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for a non-Python file")


def _outside(context: ScenarioContext) -> None:
    """Assert that an absolute path outside cwd is ignored."""
    result = _invoke(context, {"path": str(context.outside_file)})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for an outside path")


def _relative_escape(context: ScenarioContext) -> None:
    """Assert that a relative path escaping cwd is ignored."""
    result = _invoke(context, {"path": "../outside.py"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for a relative escape")


def _symlink(context: ScenarioContext) -> None:
    """Assert that a reported symlink is ignored."""
    (context.project / "linked.py").symlink_to(context.safe_file)
    result = _invoke(context, {"path": "linked.py"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for a symlink")


def _parent_symlink(context: ScenarioContext) -> None:
    """Assert that a path crossing a symlinked directory is ignored."""
    real_directory = context.project / "real"
    real_directory.mkdir()
    (real_directory / "nested.py").write_text("nested = 1\n", encoding="utf8")
    # fmt: off
    (context.project / "linked-directory").symlink_to(
        real_directory, target_is_directory=True
    )
    # fmt: on
    result = _invoke(context, {"path": "linked-directory/nested.py"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran through a symlinked directory")


def _missing_file(context: ScenarioContext) -> None:
    """Assert that a reported missing Python file is ignored."""
    result = _invoke(context, {"path": "missing.py"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for a missing path")


def _python_directory(context: ScenarioContext) -> None:
    """Assert that a .py directory is not treated as a file."""
    (context.project / "package.py").mkdir()
    result = _invoke(context, {"path": "package.py"})
    _assert_zero(result)
    _assert_no_commands(context, "Ruff ran for a directory")


def _uv_lock(context: ScenarioContext) -> None:
    """Assert that a PATH Ruff wins without invoking uv despite uv.lock."""
    (context.project / "uv.lock").write_text("", encoding="utf8")
    _write_fake_uv(context.bin_directory)
    result = _invoke(context, {"path": "safe.py"})
    _assert_zero(result)
    _assert_that(
        condition=not any(line.startswith("uv ") for line in _log_lines(context)),
        message=_log_lines(context),
    )
    _assert_file_commands(context, context.safe_file)


def _uv_only(context: ScenarioContext) -> None:
    """Assert that uv-only projects safely skip without invoking uv."""
    (context.project / "uv.lock").write_text("", encoding="utf8")
    _write_fake_uv(context.bin_directory)
    result = _invoke(context, {"path": "safe.py"})
    _assert_zero(result)
    # fmt: off
    _assert_that(
        condition="no existing Ruff command" in result.stdout, message=result.stdout
    )
    # fmt: on
    _assert_no_commands(context, "uv or Ruff ran without an existing Ruff executable")


def _missing_ruff(context: ScenarioContext) -> None:
    """Assert that no available Ruff produces a non-blocking skip."""
    result = _invoke(context, {"path": "safe.py"})
    _assert_zero(result)
    # fmt: off
    _assert_that(
        condition="no existing Ruff command" in result.stdout, message=result.stdout
    )
    # fmt: on


def _unfixable(context: ScenarioContext) -> None:
    """Assert that final lint diagnostics are reported without blocking edits."""
    result = _invoke(context, {"path": "safe.py"})
    _assert_zero(result)
    # fmt: off
    _assert_that(
        condition="reported diagnostics" in result.stdout, message=result.stdout
    )
    _assert_that(
        condition=_log_lines(context)[-1] == f"check {context.safe_file}",
        message=_log_lines(context),
    )
    # fmt: on


SCENARIOS: dict[str, Scenario] = {
    "safe-order": _safe_order,
    "multiple-files": _multiple_files,
    "apply-patch": _apply_patch,
    "non-python": _non_python,
    "outside": _outside,
    "relative-escape": _relative_escape,
    "symlink": _symlink,
    "parent-symlink": _parent_symlink,
    "missing-file": _missing_file,
    "python-directory": _python_directory,
    "uv-lock": _uv_lock,
    "uv-only": _uv_only,
    "missing-ruff": _missing_ruff,
    "unfixable": _unfixable,
}


def _create_context(temporary: Path, scenario: str) -> ScenarioContext:
    """Create a temporary project and the fake executable state for a scenario."""
    project = temporary / "project"
    project.mkdir()
    project = project.resolve()
    bin_directory = (temporary / "bin").resolve()
    bin_directory.mkdir()
    context = ScenarioContext(
        project=project,
        bin_directory=bin_directory,
        log=temporary / "ruff.log",
        safe_file=project / "safe.py",
        second_file=project / "second.py",
        unreported_file=project / "unreported.py",
        outside_file=temporary / "outside.py",
    )
    context.safe_file.write_text("x = 1\n", encoding="utf8")
    context.second_file.write_text("y = 2\n", encoding="utf8")
    context.unreported_file.write_text("z = 3\n", encoding="utf8")
    (project / "notes.txt").write_text("notes\n", encoding="utf8")
    context.outside_file.write_text("outside = 1\n", encoding="utf8")
    if scenario not in {"missing-ruff", "uv-only"}:
        _write_fake_ruff(bin_directory, unfixable=scenario == "unfixable")
    return context


def _run_scenario(scenario: str) -> list[str]:
    """Run one named maintenance scenario and return its fake-command log."""
    try:
        test = SCENARIOS[scenario]
    except KeyError as error:
        raise _UnknownScenarioError from error
    with tempfile.TemporaryDirectory() as temporary_directory:
        context = _create_context(Path(temporary_directory), scenario)
        test(context)
        return _log_lines(context)


def main() -> int:
    """Run the requested maintenance scenario."""
    if len(sys.argv) != USAGE_ERROR:
        print("usage: test_ruff_after_edit.py SCENARIO", file=sys.stderr)
        return USAGE_ERROR
    for line in _run_scenario(sys.argv[1]):
        print(line)
    return SUCCESS


if __name__ == "__main__":
    raise SystemExit(main())
