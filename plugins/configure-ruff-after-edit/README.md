# Configure Ruff After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Audit and propose safe Ruff hygiene after Python edits, with explicit approval
> required before any configuration or activation.

**Explore:** [Install](#quick-start) · [Purpose](#purpose) ·
[Environments](#supported-environments) · [Safety](#behavior-and-boundaries) ·
[Docs](#documentation-and-support)

Configure Ruff After Edit is a skills-only Codex plugin for assessing a Python
project and proposing a narrowly scoped post-edit Ruff workflow.

**This plugin does not create or activate a hook when installed.**

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

> [!CAUTION]
> A separately approved consumer hook can write safe Ruff fixes and formatting
> to reported Python files. Review the exact scope, configuration merge,
> handler, `/hooks` trust prompt, and rollback plan before approval.

## Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add configure-ruff-after-edit@codex-essentials
codex plugin list
```

Then ask Codex:

```text
Use $configure-ruff-after-edit to audit this project and propose an approval-gated Ruff after-edit configuration. Do not make changes.
```

## Use cases

| Scenario                                                         | How this plugin helps                                                                                                             | Expected result                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A Python project needs smaller, cleaner diffs after Codex edits. | Audits the project, current Ruff policy, existing hooks, and available executable route before proposing one exact-file workflow. | A reviewable recommendation without a target-project change. |
| Existing user and project hook sources may conflict.             | Inventories composition, representation, trust, matchers, and paths before proposing a minimal merge.                             | A scope-specific plan that preserves unrelated hooks.        |
| A project has Ruff only through uv.                              | Records the missing inert Ruff route instead of mutating or synchronizing the environment.                                        | A safe skip with the prerequisite clearly reported.          |

**Not a fit when:** you need a repository-wide lint pass, a commit or CI gate,
automatic dependency installation, or automatic hook activation.

## Purpose

- Perform a read-only assessment before every after-edit recommendation.
- Produce exact approval-gated writes, activation, trust, test, and rollback
  steps only after the target environment is understood.
- Keep post-edit hygiene distinct from CI and commit enforcement.

## Included Components

| Component                                                                                                    | Purpose                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                     | Plugin identity and skills-only declaration.                            |
| [`skills/configure-ruff-after-edit/SKILL.md`](skills/configure-ruff-after-edit/SKILL.md)                     | Authoritative assessment, approval, and safety workflow.                |
| [`skills/configure-ruff-after-edit/agents/openai.yaml`](skills/configure-ruff-after-edit/agents/openai.yaml) | Codex-facing discovery metadata.                                        |
| [`assets/templates/`](skills/configure-ruff-after-edit/assets/templates/)                                    | Inert consumer hook, handler, and synthetic-test templates.             |
| [`environment-assessment.md`](skills/configure-ruff-after-edit/references/environment-assessment.md)         | Scope, hook-layer, Ruff-policy, and executable-route assessment.        |
| [`hook-design.md`](skills/configure-ruff-after-edit/references/hook-design.md)                               | Approved hook contract, coverage, activation, and recovery detail.      |
| [`sources-and-attribution.md`](skills/configure-ruff-after-edit/references/sources-and-attribution.md)       | Current source links, dated attribution, and non-affiliation statement. |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                               | User-facing change history.                                             |
| [`LICENSE.md`](LICENSE.md)                                                                                   | MIT terms.                                                              |

## Supported Environments

| Requirement   | Supported value or behavior                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Codex surface | A client that supports marketplace skills and confirms the intended `PostToolUse` contract.       |
| Project types | Python projects with explicitly selected project or user scope.                                   |
| Ruff runtime  | An existing verified project-local `.venv` Ruff executable or an existing `PATH` Ruff executable. |
| Credentials   | Not required.                                                                                     |
| Network       | Not used by the packaged skill or initial generated handler.                                      |

The target project and its Ruff configuration remain authoritative. The initial
handler does not execute `uv` or `uv run`; a project with Ruff only available
through uv is safely skipped rather than synchronized, downloaded, or guessed.

## Behavior and boundaries

## Inputs and Outputs

**Inputs:** the user's requested scope; local Python, Ruff, Codex, hook, and
trust evidence; and, after approval, directly reported Python edit paths.

**Outputs:** a read-only inventory and an approval-gated proposal that states
the exact writes, matcher, runtime command, timeout, expected side effects,
coverage gaps, consumer test, activation, trust, and rollback. An approved
handler emits concise status or diagnostic output for eligible files only.

## Required Tools and Credentials

No credential is required. The assessment uses the installed Codex client and
existing local project evidence. An approved consumer handler requires an
already available Ruff executable; it does not install Ruff, Python, uv,
dependencies, or environments.

## Permissions

| Access or effect | What this plugin may do                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read             | Inspect declared scope, local Python/Ruff markers, configuration, hook layers, trust evidence, and executable paths.                                           |
| Write            | None before explicit approval; after approval, only the exact displayed consumer configuration, handler, and optional test.                                    |
| Process          | Read-only local discovery before approval; after approval, the disclosed syntax and synthetic-input validation plus existing Ruff commands for eligible files. |
| Network          | Not used by the packaged skill or initial handler.                                                                                                             |
| Authentication   | Not required.                                                                                                                                                  |

## Side Effects

Installing the plugin changes only Codex-managed plugin discovery. It does not
modify the target project, user configuration, dependencies, lockfiles, source
files, or hook trust. A separately approved, trusted consumer hook may apply
safe Ruff fixes and formatting to the exact Python files reported by a matching
event. It cannot undo the edit that triggered it.

## Human Approval Boundaries

Discovery and planning are read-only. Before a mutation, the skill presents the
complete scope, all files, configuration merge, matcher, command, timeout,
side effects, gaps, test, activation, trust, and rollback. The user must
explicitly approve both scope and writes; ambiguous wording does not count.
The user alone reviews and trusts the exact consumer hook in `/hooks`.

## Installation Behavior

Installation makes the bundled skill discoverable in Codex-managed plugin
state. This skills-only package has neither a `hooks` component nor an active
`hooks/` directory, so installation does not create, register, trust, or run a
hook.

## Uninstall and Rollback Behavior

```bash
codex plugin remove configure-ruff-after-edit@codex-essentials
```

Removing the plugin stops skill discovery but does not delete a separately
approved consumer configuration or restore prior Ruff writes. Remove the exact
approved hook entry and handler while preserving unrelated hooks, or use the
target repository's Git history or trusted backup to recover changed files.

## Verification

Maintainers can run the focused package checks from the marketplace root:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
npm run marketplace:check
```

For a consumer smoke test, first review the proposal, then run the generated
synthetic-input test in a disposable or version-controlled target. Confirm
JSON/TOML parsing and handler behavior separately from Codex discovery, `/hooks`
trust, and a live matching event.

## Known Limitations

- The package contains guidance and inert templates, not an active hook.
- The initial handler skips uv-only projects safely and does not execute `uv`
  or `uv run`.
- It processes only canonical, directly reported, existing regular `.py` files;
  it does not promise hosted-tool, arbitrary shell-write, deleted-file,
  directory, rename, or unreported-path coverage.
- Post-edit hygiene is not a CI check, commit gate, or rollback mechanism.

## Failure and Recovery

If scope, approval, Codex capability, hook-layer compatibility, existing Ruff
route, or validation is unavailable, stop and report the missing prerequisite.
Do not install a dependency, widen the matcher, execute uv, or emulate a hook.
If an approved hook needs recovery, disable its exact non-managed definition in
`/hooks` or remove the agreed configuration entry and handler; preserve other
hook sources and recover file content through Git or a trusted backup.

## Documentation and support

- [Authoritative skill](skills/configure-ruff-after-edit/SKILL.md)
- [Environment assessment](skills/configure-ruff-after-edit/references/environment-assessment.md)
- [Hook design](skills/configure-ruff-after-edit/references/hook-design.md)
- [Sources and attribution](skills/configure-ruff-after-edit/references/sources-and-attribution.md)
- [Official Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
- [Ruff documentation](https://docs.astral.sh/ruff/)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

This plugin is independent and community-maintained; it is not affiliated with
Astral, OpenAI, Codex, or PyDevTools.

## License

MIT. See [LICENSE.md](LICENSE.md).
