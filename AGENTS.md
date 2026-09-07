# Repository Guidelines

This repository designs, builds, validates, versions, and distributes a
Git-backed Codex marketplace of plugins and skills for stable use cases.

## Scope

- Automation and operations: hooks, gates, scripts, scheduled tasks, maintenance, recurring operations, and CI/CD pipelines.
- Integrations and engineering: MCP, app, API, CLI, LSP, GitHub, repository, external tools, software development, code quality, formatting, linting, typechecking, diagnostics, and testing.
- Documentation, security, analysis, and business: documentation sync/freshness, pull requests/reviews, Actions/runners, security analysis/validation/enforcement/remediation, evidence-backed data analysis, and operational workflows.

## Session Start Protocol

Before making repository changes, complete every step in this checklist:

- Inspect the repository, existing products, active toolchain, Git state, and execution environment.
- Run `codex --version`.
- Run `codex plugin --help`.
- Run `codex plugin marketplace --help`.
- Run all available `codex doctor` diagnostics.
- Read [`pending-debt.md`](docs/maintenance/pending-debt.md).
- Read [`resolved-debt.md`](docs/maintenance/resolved-debt.md).
- Check the [official Codex release notes](https://openai.com/products/release-notes/) for relevant changes from the previous 30 days.
- Probe every required tool using its current `--version` or `--help` output.
- If a required maintenance file is missing during repository bootstrap, create it before proceeding or report the missing prerequisite explicitly.

## Marketplace Product Protocol

Before creating or changing any marketplace plugin, skill, hook, script, MCP integration, app integration, schedule, runner, agent artifact, or related product artifact, read and follow [plugins/AGENTS.md](plugins/AGENTS.md). This is mandatory and non-negotiable.

This protocol governs marketplace products. It does not convert a repository-distributed standalone custom-agent TOML bundle into a plugin.

If `plugins/AGENTS.md` does not exist during repository bootstrap, create it before modifying marketplace products or report the missing prerequisite explicitly.

## Automated Quality Gates and Verification

These are repository-maintenance controls for us to create, review, maintain, and assess marketplace products. They are not plugin components, plugin dependencies, or runtime behavior, and must not be packaged or declared in a plugin merely because they validate it.

Run applicable checks proactively before declaring work clean and complete:

- Formatting.
- Linting.
- Typechecking.
- Relevant language-server diagnostics.
- Applicable unit, integration, regression, security, and adversarial tests.
- Documentation synchronization checks.
- Freshness checks for version-sensitive technical claims.

Report unresolved diagnostics, skipped checks, missing tools, and residual risks explicitly.

## Documentation and Maintenance

Project documentation is maintained under `docs/`. Read [documentation rules](docs/AGENTS.md) before creating, changing, moving, or deleting documentation.

- Add unresolved maintenance work to [`docs/maintenance/pending-debt.md`](docs/maintenance/pending-debt.md).
- Move completed work to [`docs/maintenance/resolved-debt.md`](docs/maintenance/resolved-debt.md).
- Durable decisions affecting architecture, distribution, permissions, runtime, compatibility, or operations belong in [`docs/decisions/`](docs/decisions/).
- Plans written with Superpowers skills are stored under [`docs/superpowers/`](docs/superpowers/).

## Quick Reference

- Use npm with Node.js 24.20.0 (`.nvmrc`); run `npm run check` for full validation.
- Run `npm run marketplace:build` to regenerate and validate the catalog.
- Run `npm run documentation:gate -- --base <base> --head <head>` for plugin docs.
- Read [documentation rules](docs/AGENTS.md) and [plugin package rules](plugins/AGENTS.md).

## Directory Map

- `schemas/`: all repository schemas. `scripts/`: generators, validators, and pipeline/code-quality tooling. `tests/`: tests for those areas.
- `docs/`: official documentation for decisions, audits, maintenance debts, operations, and superpowers plans/specs; read `docs/AGENTS.md` first.
- `templates/`: reusable manifest, README, changelog, and license templates.

## Source of Truth

- `plugins/<plugin-id>/.codex-plugin/plugin.json` owns plugin identity, version, metadata, and components.
- `.agents/plugins/marketplace.json` is generated from validated manifests; do not hand-edit it.
- Plugins are self-contained. Distribution is the public repository and `main` catalog. Release Please may create immutable plugin tags and GitHub Release records using `GITHUB_TOKEN`, but must never publish packages or upload distribution archives, checksums, or other release assets.

## Working Rules

- Use pull requests for product, package, catalog, script, test, schema, security, permission, refactor, compatibility, release-control, and policy changes. Direct pushes are limited to non-policy plans, audits, and maintenance records under `docs/`.
- Product changes update the affected README, `CHANGELOG.md`, and manifest; include validation evidence.
- Run applicable checks, report skips and risks, and keep docs synchronized.
- Follow the global `AGENTS.md` policy for credentials.
- Use Conventional Commits; do not commit or push without explicit request.
- Owner: Nery Samuel Murillo (`nerymurillohnd`). Keep personal and Forestal MT business context outside this public guide; do not infer private business requirements from this repository.

## Roadmap

- Strengthen validation for plugin skills, apps, MCP integrations, and assets; expand the catalog with explicit permissions and recovery behavior.
- Keep README as the public homepage; expand contributor guidance and require validation evidence.

## Template Use

Read and use the matching template before creating or updating `plugin.json`,
`agents/openai.yaml`, root/plugin `README.md`, `CHANGELOG.md`, or `LICENSE.md`:
manifest `templates/codex-plugin-plugin.json`; agent manifest
`templates/agents-openai.yaml`; root README
`templates/root-README-recommended-template.md`; plugin README
`templates/plugin-README-reusable-template.md`; changelog
`templates/CHANGELOG-reusable-template.md`; license
`templates/LICENSE-reusable-template.md`.
