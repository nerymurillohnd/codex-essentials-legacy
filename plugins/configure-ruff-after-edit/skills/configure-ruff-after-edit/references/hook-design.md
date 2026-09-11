# Hook design

Use this reference only after the environment assessment establishes a target
scope and current Codex hook capability.

## Proposed contract

The inert templates provide one `PostToolUse` command hook with matcher
`Write|Edit|apply_patch`, a Node.js handler command, and a 30-second timeout.
They are POSIX-only: the command safely reports a missing `node` executable,
the handler rejects non-POSIX hosts, and this template set has no Windows
`commandWindows` override.
The target Codex client must confirm that this matcher covers its intended
Python edit paths before it is proposed. Narrow the matcher if that is the
smallest confirmed sufficient coverage.

`PostToolUse` is appropriate for post-edit hygiene, not prevention: it runs
after supported tools return and cannot undo an edit. The handler defensively
parses JSON from standard input, accepts directly reported path fields plus
`apply_patch` Add/Update directives, and accepts only existing canonical
regular `.py` files beneath the reported working directory. It rejects
directories, missing or deleted files, relative or absolute escapes, symlinks
outside that directory, and paths that were not reported by the event.

For each eligible file, it uses the target project's existing Ruff
configuration and runs, in order:

```text
ruff check --fix --no-unsafe-fixes <file>
ruff format <file>
ruff check <file>
```

`project-hooks.json` and `user-hooks.json` are discovery/default templates and
omit `--config`. The explicit strict-profile templates use only
`<project-root>/.codex/ruff.toml` with
`<project-root>/.codex/hooks/ruff_after_edit.mjs`, or `~/.codex/ruff.toml`
with `~/.codex/hooks/ruff_after_edit.mjs`. The handler accepts a strict
configuration only at that canonical consumer-owned location; it rejects a
plugin package asset or any other `--config` path.

Before approval, record three decisions: global, project/repository, or
directory-bounded scope; policy source (discovered configuration, Ruff defaults,
reviewed adjustment, or bundled strict profile); and configuration
materialization. A directory-bounded scope records a canonical directory and
rejects paths outside it, but it is not a Codex configuration layer. A project
with no existing Ruff configuration may materialize a reviewed root
`<project-root>/ruff.toml` and retain normal Ruff discovery without `--config`.
A reviewed adjustment states the exact approved content, consumer-owned path,
and discovery or canonical `--config` route. It must never overwrite existing
configuration or use a plugin asset as runtime configuration.

The initial handler resolves only an already executable project-local `.venv`
Ruff or verified `PATH` Ruff. It does not execute `uv`, `uv run`, `uvx`, `pip`,
or a network/download/install action. An uv-only project therefore emits a
concise safe-skip diagnostic rather than guessing or changing its environment.

## Approval, activation, and recovery

Before a write, display the exact configuration merge, handler path, command,
matcher, timeout, test command, file-write effects, process effects, gaps, and
rollback. On approval, merge only the selected configuration representation;
preserve existing groups and do not write both inline and JSON hook sources in
the same layer.

Validate JSON/TOML and execute the synthetic-input test. Then the user must
inspect the exact source in `/hooks` and decide whether to trust it. A passing
synthetic test does not establish discovery, trust, or a live Codex event.

To recover, disable the exact non-managed definition in `/hooks` or remove the
approved configuration entry, handler, and materialized configuration while
preserving unrelated hooks and configuration. Remove a materialized
configuration only when this approved installation created it; use
target-project Git history or a trusted backup to restore a reviewed adjustment
or any Ruff edits. Removing the hook prevents future runs but cannot undo
completed edits.

## Coverage limits

This design does not promise coverage for hosted tools, tools the current
client does not expose to `PostToolUse`, arbitrary shell writes, deleted files,
renames, directory operations, or paths omitted from the event. It is neither
a CI check nor a commit gate. Unfixable diagnostics are reported after the
event; they are not silently suppressed or converted into a whole-project
scan.
