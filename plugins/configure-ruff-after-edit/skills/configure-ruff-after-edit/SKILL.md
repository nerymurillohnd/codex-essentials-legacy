---
name: configure-ruff-after-edit
description: Use when auditing or proposing Ruff checks after Python edits. Require explicit approval before configuring or enabling any after-edit behavior.
---

# Configure Ruff After Edit

Assess and propose narrowly scoped Ruff hygiene after Codex reports Python file
edits. Installing this plugin makes this skill discoverable only; it does not
create or activate a hook.

## Non-negotiable boundaries

- Begin with a read-only assessment. Do not create, modify, replace, enable,
  trust, or register a hook until the user approves the complete proposal.
- Keep global, project/repository, and directory-bounded scopes distinct.
  Project scope is the default for one version-controlled repository; user
  scope has a wider effect and needs an explicit choice. Select a project or
  user scope explicitly. A directory-bounded
  scope must name its canonical directory and applies only to event-reported
  regular Python files contained beneath it; it is an execution boundary, not
  an implicit Codex configuration layer.
- This package includes no active plugin hook. Installation does not modify a
  target project, user configuration, dependencies, lockfiles, source files,
  or trust state.
- Do not install Ruff, uv, Python, dependencies, environments, editor
  extensions, pre-commit hooks, or network tools. Do not change Ruff policy,
  configuration, suppressions, or use unsafe fixes.
- Do not claim event hygiene is CI, commit, or repository-wide enforcement.
  A `PostToolUse` action happens after the edit and cannot undo its side effect.
- The initial generated handler does **not** execute `uv`, including `uv run`.
  It uses only an already verified project-local `.venv` Ruff executable or an
  existing `PATH` Ruff executable. A project where Ruff is available only via
  uv is skipped safely and reported as unavailable.
- The initial generated handler requires an already available Node.js runtime
  and supports POSIX hosts only. Do not create a Windows hook command or claim
  Windows support for this template set.

## Read-only assessment

Before making a recommendation, read
[environment assessment](references/environment-assessment.md) and inspect:

1. The user's requested outcome, declared global, project/repository, or
   directory-bounded scope, operating system, Git root, and target working
   directory. For a directory-bounded scope, record the canonical directory,
   confirm its containment in the selected project, and reject any event path
   outside it.
2. The installed Codex version and current hook capability; recheck the
   published [Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
   for the target version before writing consumer configuration.
3. Existing project, user, plugin, and managed hook sources; their active trust
   state; and whether one layer already contains `hooks.json` or inline hook
   TOML. Preserve unrelated matcher groups and do not create both forms in one
   layer.
4. Python markers, Ruff configuration (`pyproject.toml`, `ruff.toml`, or
   `.ruff.toml`), the applicable project policy, and the exact existing Ruff
   executable route. Never infer a route from a lockfile alone.
5. The smallest confirmed matcher for the target client, direct-path coverage,
   non-observable tool gaps, and the handler's timeout and failure behavior.
6. Record all three required choices before every write: hook scope (global,
   project/repository, or directory-bounded); policy source (bundled strict
   profile, discovered configuration, reviewed adjustment, or Ruff defaults);
   and configuration materialization. Existing discovery and Ruff defaults
   create no configuration and omit `--config`. For a strict project profile,
   the only approved runtime path is `<project-root>/.codex/ruff.toml` beside a
   copied handler at `<project-root>/.codex/hooks/ruff_after_edit.mjs`; for a
   strict user profile, use `~/.codex/ruff.toml` beside
   `~/.codex/hooks/ruff_after_edit.mjs`. A project with no Ruff configuration
   may instead materialize an approved root `<project-root>/ruff.toml` and use
   normal Ruff discovery without `--config`. A reviewed adjustment requires
   its exact approved content, consumer-owned destination, and rollback to be
   displayed before it is written; it never overwrites discovered configuration.

If any prerequisite is missing, conflicting, or outside the declared scope,
stop and report it. Do not guess a command or widen scope.

## Recommendation and approval

Use [hook design](references/hook-design.md) to present one concrete,
reviewable recommendation. Before asking for approval, show:

- all three recorded choices, selected scope and directory containment where
  applicable, existing-hook interactions, and every file to be written;
- the exact `PostToolUse` matcher, handler command, per-process timeout, and
  expected safe-fix → format → final-lint sequence;
- the verified Ruff route and an explicit skip outcome when no existing
  project-local or `PATH` executable is available;
- direct-file coverage and gaps, including that directories, deleted files,
  symlink escapes, unreported paths, hosted tools, and arbitrary shell writes
  are not promised coverage;
- expected writes, local process execution, diagnostics, consumer test,
  activation, `/hooks` review and trust, and rollback steps.
- the selected configuration materialization: no file for existing/default
  discovery; canonical consumer-owned `.codex/ruff.toml` only for a strict or
  reviewed `--config` path; or a new approved `<project-root>/ruff.toml` for
  normal discovery. Never use a file under the installed plugin package as a
  runtime configuration dependency.

Then wait for explicit approval of both the selected scope and the exact
writes. Approval is item-specific. If the plan needs a new dependency,
configuration source, command, or scope, stop and present a revised proposal.

## Approved implementation and verification

After approval only, copy and adapt the inert templates without adding a
plugin hook component. Write only the agreed handler, one selected hook source,
the explicitly approved materialized configuration if any, and an optional
maintenance test. The handler must process only canonical, event-reported
existing regular `.py` files; run `ruff check --fix --no-unsafe-fixes`, then
`ruff format`, then final `ruff check` for each file; and retain the target
project's Ruff configuration. It must use `--` before every file operand so a
reported filename cannot become a Ruff option. Remaining lint diagnostics are
reported after the full per-file sequence and do not suppress formatting, final
lint, or later eligible files while the event budget remains.

Validate configuration syntax and run the generated synthetic-input test.
Distinguish static parsing and handler behavior from Codex discovery, user
trust, and a live matching event. The user independently reviews the exact
definition in `/hooks` and decides whether to trust it. Do not trust a hook or
claim live execution on the user's behalf.

Rollback removes only a configuration file that this approved installation
materialized, the exact hook entry, and the copied handler; preserve unrelated
configuration and hooks. Restore any prior or adjusted configuration from the
target project's Git history or trusted backup rather than replacing it.

For sources, dates, scope of attribution, and non-affiliation, see
[sources and attribution](references/sources-and-attribution.md).
