# 🧰 Repository Maintenance

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Maintain repository documentation and maintenance records from evidence, local conventions, and reusable templates.

## Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add repo-maintenance@codex-essentials
```

Then ask Codex:

```text
Use $repo-maintenance to audit this repository's maintenance documentation. Do not modify files.
```

## Use cases

- Create or repair a root README, changelog, ADR, or maintenance debt record.
- Adapt a reusable template to an unfamiliar repository's existing conventions.
- Verify that maintenance records distinguish evidence, inference, planned work, and unresolved gaps.
- Maintain a Codex plugin README or skill metadata when those artifacts actually exist.

This plugin is not a source-code implementation workflow, release publisher, license selector, or remote Git operation.

## Purpose

- Keep repository documentation aligned with observable project behavior.
- Provide adaptable starting points for recurring maintenance records.
- Treat bundled templates as coverage maps to adapt from repository evidence,
  not forms to complete in full.
- Offer a short `AGENTS.md` pre-commit documentation-maintenance reminder when
  the user wants one.
- Offer to save durable repository documentation conventions to memory after
  completing maintenance work, only when the user wants that.
- Preserve local conventions and surface missing evidence instead of guessing.

## Included Components

- [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json): plugin identity and
  component declaration.
- [`skills/repo-maintenance/SKILL.md`](skills/repo-maintenance/SKILL.md):
  routing, template selection, acceptance, and safety contract.
- [`skills/repo-maintenance/agents/openai.yaml`](skills/repo-maintenance/agents/openai.yaml):
  Codex metadata for the skill.
- [`skills/repo-maintenance/assets/repository-readme-template.md`](skills/repo-maintenance/assets/repository-readme-template.md):
  root repository README coverage map.
- [`skills/repo-maintenance/assets/plugin-readme-template.md`](skills/repo-maintenance/assets/plugin-readme-template.md):
  Codex plugin or package README coverage map.
- [`skills/repo-maintenance/assets/`](skills/repo-maintenance/assets/): ADR,
  debt, changelog, license, and conditional skill metadata templates.
- [`CHANGELOG.md`](CHANGELOG.md): user-facing change history.
- [`LICENSE.md`](LICENSE.md): MIT license terms.

## Supported Environments

| Requirement | Supported value                                                                        |
| ----------- | -------------------------------------------------------------------------------------- |
| Host        | Codex plugin host with skill loading.                                                  |
| Target      | Repositories containing Markdown, YAML, or text documentation.                         |
| Credentials | None required by this plugin.                                                          |
| Network     | Not required for local maintenance; use only when current external evidence is needed. |

## Inputs and Outputs

**Inputs:** User request, repository instructions, existing documents, project conventions, and verifiable evidence.

**Outputs:** Audits, adapted local documentation, verification results, and explicit unresolved gaps.

## Required Tools and Credentials

No plugin-specific credential or external service is required. The target repository's own formatter, linter, and documentation gates take precedence.

## Permissions

| Access          | Boundary                                                              |
| --------------- | --------------------------------------------------------------------- |
| Read            | Relevant files and repository instructions within the declared scope. |
| Write           | Only explicitly requested local documentation files.                  |
| Process         | Applicable local validation commands.                                 |
| Network         | Read-only authoritative sources only when needed and authorized.      |
| Remote mutation | Not performed by this plugin.                                         |

## Side Effects

Installation changes Codex-managed plugin state. Using the skill can change requested repository documentation; it does not automatically change source code, dependencies, credentials, Git history, or remote state.

## Human Approval Boundaries

Audits are read-only. A direct request to create or update named local documents authorizes only that scoped edit. Commits, pushes, releases, publication, deployment, PRs, and credential changes remain separate actions.

## Installation Behavior

Installation makes the skill available to Codex. It does not install project dependencies or rewrite the target repository.

The bundled templates are coverage maps, not required final-document schemas.
The skill fills only evidence-backed, audience-useful sections and removes
unsupported, empty, irrelevant, stack-specific, or non-evidence-backed content
before publishing a final document.

After a completed audit, setup, or maintenance update, the skill asks whether
the user wants to add a short `AGENTS.md` pre-commit documentation-maintenance
reminder or save durable repository documentation conventions to memory for
consistent future maintenance. It does neither automatically.

## Boundaries

The skill reads project instructions and existing records before editing. Its recommended default is root `docs/`, with `docs/decisions/` and `docs/maintenance/`, while preserving root README/changelog/license files; an existing repository convention or an explicit custom choice takes precedence. It may write only the explicitly requested local documentation files. It does not commit, push, publish, deploy, create PRs, change credentials, or invent missing project facts.

Installation changes Codex-managed plugin state only. Using the skill may modify the target repository when the user explicitly requests a local documentation change.

## Verification

From the marketplace repository, maintainers can run:

```bash
npm run marketplace:check
```

Review the generated document, its links, local formatting/lint output, and the final Git diff before accepting the change.

## Uninstall and Rollback Behavior

```bash
codex plugin remove repo-maintenance@codex-essentials
```

Uninstall removes the managed plugin installation. It does not revert documentation changes previously made in a target repository; recover those through that repository's Git history or backups.

## Known Limitations

- The skill cannot select a missing project convention or legal license without evidence.
- It provides templates, not a universal document schema or release engine.
- Host discovery and available validation tools vary by environment.

## Failure and Recovery

When a required source, permission, or validation tool is unavailable, the skill reports the exact gap and leaves the affected operation incomplete. Resolve the missing prerequisite, then rerun the narrow document check before broader repository gates.

## License

MIT. See [`LICENSE.md`](LICENSE.md).
