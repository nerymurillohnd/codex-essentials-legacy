# Configure Ruff After Edit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Audit and propose Ruff checks after Python edits, with explicit approval
> required before any configuration or activation.

Configure Ruff After Edit is a skills-only Codex plugin. Installation exposes
the skill but does not install or enable a hook automatically.

## Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add configure-ruff-after-edit@codex-essentials
codex plugin list
```

Then ask Codex:

```text
Use $configure-ruff-after-edit to audit this project and propose an approval-gated Ruff after-edit configuration.
```

## Purpose

- Audit existing Python, Ruff, and Codex configuration without mutation.
- Propose a scoped, reviewable Ruff after-edit workflow.
- Preserve human control over configuration, activation, trust, and rollback.

## Included Components

| Component                                                             | Purpose                                      |
| --------------------------------------------------------------------- | -------------------------------------------- |
| [Plugin manifest](.codex-plugin/plugin.json)                          | Plugin identity and skills-only declaration. |
| [Skill](skills/configure-ruff-after-edit/SKILL.md)                    | Approval-gated workflow and safety boundary. |
| [Agent metadata](skills/configure-ruff-after-edit/agents/openai.yaml) | Codex discovery metadata.                    |
| [Changelog](CHANGELOG.md)                                             | User-facing change history.                  |
| [License](LICENSE.md)                                                 | MIT terms.                                   |

## Supported Environments

| Requirement   | Supported value or behavior                                          |
| ------------- | -------------------------------------------------------------------- |
| Codex surface | Codex clients that support marketplace skills.                       |
| Project types | Python projects with an explicitly declared target scope.            |
| Runtime/tools | Existing Ruff and Codex tooling are inspected before recommendation. |
| Credentials   | Not required.                                                        |
| Network       | Not used by the packaged skill.                                      |

## Inputs and Outputs

**Inputs:** a user request, declared project or user scope, and relevant local
Python, Ruff, Codex, and hook configuration.

**Outputs:** a read-only inventory and an approval-gated proposal describing
the exact configuration, activation, verification, and rollback steps.

## Required Tools and Credentials

No credential is required. A target implementation may require Ruff and the
Codex features supported by the selected scope; the skill verifies those
prerequisites before recommending changes.

## Permissions

| Access or effect | What this plugin may do                                             |
| ---------------- | ------------------------------------------------------------------- |
| Read             | Inspect the declared scope and relevant configuration.              |
| Write            | None before explicit approval.                                      |
| Process          | Read-only discovery before approval; approved validation afterward. |
| Network          | Not used.                                                           |
| Authentication   | Not required.                                                       |

## Side Effects

Installation changes only Codex-managed plugin state and skill discovery. It
does not create a target configuration, enable an after-edit workflow, or
register an active plugin hook.

## Human Approval Boundaries

Discovery and planning are read-only. Any configuration, generated file, hook,
trust decision, or process execution that changes state requires explicit
approval after the complete proposal identifies project or user scope.

## Installation Behavior

Installation adds this skill to Codex-managed plugin state. It does not modify
the target project, user configuration, dependencies, lockfiles, source files,
or hook configuration.

## Uninstall and Rollback Behavior

```bash
codex plugin remove configure-ruff-after-edit@codex-essentials
```

Removal stops skill discovery. It does not delete unrelated configuration or
revert a separately approved change; use the target's Git history or recorded
rollback steps for those changes.

## Verification

From the marketplace repository, run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
npm run marketplace:check
```

The focused test verifies that the package remains skills-only and inert by
default. It does not prove a separately approved target configuration.

## Known Limitations

- The package intentionally contains no hook implementation or active hook
  declaration.
- A target's Ruff version, Python project structure, and Codex capabilities
  must be verified before any specific after-edit design is approved.

## Failure and Recovery

If the scope, existing configuration, required tool, approval, or validation
gate is unavailable, stop and report the missing prerequisite. Do not activate
or emulate an after-edit workflow without the corresponding approval and
evidence.

## Documentation and support

- [Skill workflow](skills/configure-ruff-after-edit/SKILL.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [License](LICENSE.md)

## License

MIT. See [LICENSE.md](LICENSE.md).
