# 🐍 Ruff After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Use Ruff intentionally, then design an approval-gated Bash after-edit and Stop gate for Codex when requested.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) · [Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) · [Docs](#-documentation-and-support)

Ruff After Edit is a skills-only Codex plugin. Installation makes its skill and
references available; it does not create, activate, trust, or run a hook.

> [!CAUTION]
> An approved consumer hook can rewrite Python files and a `Stop` gate can prevent clean turn completion. Review scope, commands, and `/hooks` trust first.

## ⚡ Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add ruff-after-edit@codex-essentials
```

Ask Codex to use `$ruff-after-edit` to lint or format Python, or to assess and
propose a Ruff after-edit workflow without making changes.

## 🎯 Use cases

| Scenario                                                     | Result                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| A Python change needs deliberate Ruff linting or formatting. | A verified Ruff command route.                              |
| A repository needs edit hygiene.                             | An approval-gated `PostToolUse` and `Stop` Bash pair.       |
| Existing Ruff policy must remain authoritative.              | Discovery, approved adaptation, or strict-profile proposal. |

**Not a fit when:** automatic hook or dependency installation, CI enforcement, or policy bypass is required.

## 🎯 Purpose

Provide deliberate Ruff guidance and a safe, reviewable path to consumer-owned Codex hooks.

## 🧰 Included Components

The package contains the `ruff-after-edit` skill, Codex-facing agent metadata, and references.

## 🖥️ Requirements and compatibility

## Supported Environments

Codex with marketplace skills; POSIX Bash consumer hooks; Python projects using an approved Ruff route.

## 🔐 Behavior and boundaries

## Inputs and Outputs

Inputs are the user's Ruff or hook request and local project evidence. Outputs are commands, proposals, and, only after approval, consumer-owned files.

## Required Tools and Credentials

No credentials are required. Consumer hooks require Bash, Ruff, and `jq` for PostToolUse.

## Permissions

Read-only assessment occurs first. Approved consumer hooks may read payloads and source files, run Ruff, and rewrite only Ruff-safe fixes and formatting.

## Side Effects

Installation changes Codex plugin discovery only. An approved consumer hook can rewrite eligible Python files.

## Human Approval Boundaries

Explicit approval is required before any consumer file, configuration, hook wiring, or pre-commit gate is created.

## Installation Behavior

Installation does not create hooks, configuration, dependencies, environments, or trust state.

## Boundaries

The skill first performs read-only assessment. It requires explicit approval
before writing handlers, Ruff configuration, hook configuration, project
instructions, or pre-commit configuration. It never weakens Ruff policy,
installs dependencies, creates plugin hooks, or trusts a hook for the user.

## Included components

- [Authoritative skill](skills/ruff-after-edit/SKILL.md)
- [Codex workflow](skills/ruff-after-edit/references/codex-four-layer-ruff-workflow.md)
- [Official hooks freshness reference](skills/ruff-after-edit/references/official-codex-hooks.md)
- [Validation reference](skills/ruff-after-edit/references/codex-hook-validation.md)

## 🔁 Uninstall and Rollback Behavior

An approved consumer workflow requires Bash, the selected Ruff route, and `jq`
for the post-edit handler. `uvx` is only used when explicitly approved. Review
the definition in `/hooks` and trust it yourself. Remove only the approved
consumer hook entries, scripts, and any configuration files that installation
created; uninstalling this plugin does not remove those consumer files.

Remove the plugin with `codex plugin remove ruff-after-edit@codex-essentials`. Roll back consumer changes by removing only approved entries and files, preserving unrelated configuration.

## ✅ Verification

Maintainers run `npm run marketplace:check`. Consumers follow the smoke tests
in [Codex Hook Validation](skills/ruff-after-edit/references/codex-hook-validation.md).

## 🚧 Known Limitations

- PostToolUse cannot undo an edit that already occurred.
- Stop prevents clean completion but cannot forbid every later tool call during continuation.

## Failure and Recovery

If a runtime, scope, configuration, trust state, or payload is unavailable, stop and report it. Repair the prerequisite or remove the approved consumer hook; do not weaken Ruff policy.

## 📚 Documentation and support

- [Authoritative skill](skills/ruff-after-edit/SKILL.md)
- [Official Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

## Attribution

This plugin consolidates public Ruff, uv, PyDevTools, and official Codex
guidance. It is not affiliated with Astral, PyDevTools, or OpenAI.
