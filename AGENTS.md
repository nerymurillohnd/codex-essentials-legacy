# Repository Guidelines

Codex Essentials is a Git-backed public marketplace for reusable Codex plugins
and skills.

## Repository Model

- `plugins/<plugin-id>/.codex-plugin/plugin.json` is the authored source of
  truth for plugin identity, version, metadata, and components.
- `.agents/plugins/marketplace.json` is generated metadata. Do not edit it by
  hand.
- Plugins are self-contained and distributed from the public repository and
  `main` catalog.
- Release Please may create plugin tags and GitHub Releases, but must not
  publish packages or upload release assets.

## Session Start Protocol

Before making repository changes:

- Inspect the repository, existing products, active toolchain, Git state, and
  execution environment.
- Run `codex --version`.
- Run `codex plugin --help`.
- Run `codex plugin marketplace --help`.
- Run available `codex doctor --all --json` diagnostics.
- Read `docs/maintenance/pending-debt.md`.
- Read `docs/maintenance/resolved-debt.md`.
- Check Codex release notes from the previous 30 days for relevant changes.
- Probe each required tool using its current `--version` or `--help`.
- Proceed with the prompted user's input.

## Change Routing

| Change                                                                | Required instruction and validation                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Plugin, skill, hook, app, MCP, manifest, catalog, or release metadata | Read [plugins/AGENTS.md](plugins/AGENTS.md); run applicable plugin and marketplace checks. |
| Repository documentation                                              | Read [docs/AGENTS.md](docs/AGENTS.md); run the applicable documentation gate.              |
| Tooling, schema, validator, generator, workflow, or test              | Run `npm run check`.                                                                       |
| Current Codex behavior or compatibility                               | Consult official OpenAI documentation and relevant release notes.                          |

If a required maintenance file or instruction file is absent, stop and report the
missing prerequisite.

## Plugin Publication Gate

Do not publish, register, or push a marketplace plugin for a pull request until
all of the following are complete:

- A valid `.codex-plugin/plugin.json` manifest exists.
- Every included skill has a valid `skills/<skill-id>/agents/openai.yaml`.
- The package includes `README.md`, `CHANGELOG.md`, and `LICENSE.md`.
- The marketplace entry is generated in `.agents/plugins/marketplace.json`.
- The root `README.md` catalog includes the plugin.
- The package, its included skills, and its hooks have been evaluated,
  validated, and verified against current official OpenAI and OpenAI Developers
  documentation.

## Quality and Completion

- Run all applicable formatters, linters, type checks, tests, documentation
  checks, and freshness checks before claiming completion.
- Report failed or skipped checks, missing tools, unresolved diagnostics, and
  residual risks.
- Do not bypass hooks, tests, signatures, branch protections, or validation
  gates.

## Commands and Layout

- Use the NVM-managed Node.js and npm versions declared in `.nvmrc` and
  `package.json`.
- `npm run check` is the complete repository validation gate.
- `npm run marketplace:build` regenerates and validates the marketplace.
- `npm run documentation:gate -- --base <base> --head <head>` validates plugin
  documentation changes.
- `schemas/`, `scripts/`, and `tests/` contain repository contracts and
  tooling.
- `docs/` contains canonical repository documentation.
- `templates/` contains reusable authoring templates.

## Documentation Records

- Track unresolved work in `docs/maintenance/pending-debt.md`.
- Move verified resolutions to `docs/maintenance/resolved-debt.md`.
- Record durable architecture or operations decisions in `docs/decisions/`.
- Store approved Superpowers plans and specs in `docs/superpowers/`.

## Working Rules

- Prefer pull requests for product, package, catalog, script, test, schema,
  security, permission, refactor, compatibility, release-control, and policy
  changes. Direct pushes require explicit user authorization.
- Before creating or managing a pull request, apply every label relevant to its
  nature, scope, and impact. At least one label is required before review,
  merge, or handoff.
- Product changes update the affected README, `CHANGELOG.md`, and manifest; include validation evidence.
- Use Conventional Commits; do not commit or push without explicit request.
- Refer to secrets only as `${VAR}` and never commit credentials.
- Owner: Nery Samuel Murillo (`nerymurillohnd`). Keep personal and Forestal MT business context outside this public guide; do not infer private business requirements from this repository.

## Template Use

Read the matching repository template before creating or updating
`plugin.json`, `agents/openai.yaml`, a root or plugin README, `CHANGELOG.md`,
or `LICENSE.md`.
