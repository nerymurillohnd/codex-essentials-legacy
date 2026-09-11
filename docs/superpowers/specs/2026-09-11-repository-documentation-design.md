# Repository Documentation Plugin Design

## Status

Approved for planning on 2026-09-11. Implementation remains subject to the
repository validation contract and the user's withheld remote-mutation
authority.

## Goal

Create the publicly distributable `repository-documentation` plugin as the
single replacement for `doc-keeper` and `repo-maintenance`. It provides two
independently discoverable skills whose boundary is documentation lifecycle,
not document type.

## Scope

The plugin contains exactly two skills:

- `repository-documentation:create` implements an authorized repository or
  project documentation system.
- `repository-documentation:maintain` maintains existing documentation so it
  remains current, curated, and evidence-backed after repository work.

The replacement package is created from the repository templates. Source
packages are reference material only. No file, instruction, asset, or example
is moved or mechanically merged from either retired package.

## Public Distribution

The plugin is a public marketplace product. Consumers add the Codex Essentials
marketplace and install `repository-documentation@codex-essentials`. The
generated catalog's `./plugins/repository-documentation` path is repository
build metadata, not a consumer-local-only distribution model.

No compatibility alias, shim, or deprecation period is provided. The user has
confirmed that no third party has installed either retired package. Git history
remains the recovery path.

## Skill Contracts

### Create

`create` creates or implements only explicitly authorized documentation.

- Inspect repository instructions, current documents, evidence, and tooling.
- Inventory existing records and identify only supported documentation gaps.
- Propose the exact artifact set and resulting tree for material system work.
- Require explicit acceptance before creating, replacing, moving, or
  reorganizing material documentation.
- Create evidence-backed README, CHANGELOG, LICENSE, CODE OF CONDUCT, ADR,
  pending-debt, resolved-debt, index, structure, or template artifacts only
  when they are accepted and needed.
- Treat bundled templates as coverage maps and remove unsupported content.

`create` does not claim that every repository requires every document. It does
not publish, tag, commit, push, create pull requests, or mutate remote state.

### Maintain

`maintain` maintains existing in-scope documentation after completed work or an
explicit request to audit, curate, reconcile, or refresh it.

- Establish the completed work and documentary facts from repository evidence.
- Compare in-scope documents with current implementation, configuration,
  validation, decisions, release ownership, and maintenance state.
- Update only records supported by confirmed facts, including README,
  CHANGELOG, LICENSE, CODE OF CONDUCT, ADR, debt, indexes, and package docs.
- Preserve document ownership and use an existing release mechanism rather
  than recreating or simulating its generated output.
- Report confirmed facts, unresolved gaps, validations, local edits, and remote
  actions not performed.
- Route structural or system-wide reorganization to `create` for proposal and
  acceptance.

`maintain` never invents history, dates, decisions, versions, approval, or
release state. It does not publish, tag, commit, push, create pull requests, or
mutate remote state.

## Package Structure

```text
plugins/repository-documentation/
├── .codex-plugin/plugin.json
├── CHANGELOG.md
├── LICENSE.md
├── README.md
└── skills/
    ├── create/
    │   ├── SKILL.md
    │   ├── agents/openai.yaml
    │   └── references/
    └── maintain/
        ├── SKILL.md
        ├── agents/openai.yaml
        └── assets/
```

Each skill owns only the references or templates it consumes. Shared generic
instructions, duplicate templates, and unused example files are excluded.

## Retirement and Integration

After the new package validates, remove `plugins/doc-keeper` and
`plugins/repo-maintenance`. Replace their active references in manifests,
catalog generation inputs, Release Please configuration and state, README,
release notes, tests, fixtures, and current documentation.

Historical Git commits preserve the prior package state. Current documentation
must not retain dangling links or operational references to retired paths.

## Acceptance Criteria

- The new package is schema-valid and self-contained.
- The manifest declares only the skills directory and the package contains
  exactly `create` and `maintain`.
- Each skill has exactly one valid `agents/openai.yaml` and concise,
  lifecycle-specific instructions.
- All created repository artifacts are English.
- The generated marketplace contains the replacement and excludes both retired
  plugins.
- Release Please components and state exactly match remaining plugin paths.
- No active catalog, release, root README, test fixture, template, or
  documentation reference points to either retired plugin.
- Formatting, Markdown linting, plugin and marketplace checks, type checks,
  full tests, release validation, documentation gate, and `git diff --check`
  pass with fresh output.
- No commit, push, tag, publication, pull request, release, merge, or remote
  configuration change is performed.
