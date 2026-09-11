# Environment assessment

Use this checklist before proposing any write. Assessment is read-only and does
not activate a hook, invoke Ruff, or execute `uv`.

## Scope and existing state

1. Ask whether the user wants one repository or a user-wide behavior. Confirm
   the Git root for project scope; do not infer a user-wide choice.
2. Record the operating system, Codex version, target working directory, and
   whether the current Codex surface supports the needed command hook path.
   The initial handler and command templates require Node.js on a POSIX host;
   report Windows as unsupported rather than proposing a `commandWindows`
   override.
3. Inventory `.codex/hooks.json`, `.codex/config.toml`, user equivalents,
   enabled plugin hooks, and managed sources. Read `/hooks` output when the
   user has made it available. Sources compose, so preserve unrelated groups.
4. Identify the existing representation in the chosen layer. Use either
   `hooks.json` or inline hook TOML in that layer, never both.

## Python and Ruff evidence

Inspect Python project markers, `pyproject.toml`, `uv.lock`, lockfiles, and
Ruff configuration files. Report the effective configuration path if it is
known, but do not create or override one. Ruff configuration discovery and
policy remain owned by the target project.

Probe only existing executable candidates without installation or synchronization:

1. `<project>/.venv/bin/ruff`;
2. `ruff` available on `PATH`.

Require a successful `--version` probe before recommending either route.
The initial handler deliberately does not execute `uv`, including `uv run`.
`uv.lock` and a Ruff declaration do not prove an inert executable route, and
the official uv documentation says `uv run` can create or update the project
environment. If no project-local or `PATH` Ruff is verified, report a safe
skip. In particular, do not configure automatic processing for an uv-only
project unless a later separately approved design changes this contract.

## Configuration selection

Ask the user to choose discovered configuration, Ruff defaults, a reviewed
adjustment, or the bundled strict profile. Existing discovery and defaults
create no file and omit `--config`. The strict profile can be copied only after
approval to `<project-root>/.codex/ruff.toml` for project scope or
`~/.codex/ruff.toml` for user scope. Confirm the matching copied Node.js
handler is respectively `<project-root>/.codex/hooks/ruff_after_edit.mjs` or
`~/.codex/hooks/ruff_after_edit.mjs`; this structural relationship prevents an
installed plugin asset from being selected as runtime configuration.

## What to report

Report scope, source layers, trust status, chosen representation, Ruff route,
configuration evidence, matcher evidence, timeouts, expected writes, and all
coverage gaps. If any item cannot be verified, label it as unavailable rather
than filling it in from convention.
