# Repository Documentation Plugin Design

## Status

Approved for implementation planning on 2026-09-11. The specification was
reconciled with current official OpenAI plugin and skill documentation on
2026-09-11. Implementation remains subject to the repository validation
contract and the user's withheld remote-mutation authority.

## Goal

Create the `repository-documentation` plugin as the single replacement for
`doc-keeper` and `repo-maintenance` in the Codex Essentials repository/CLI
marketplace. It provides two independently discoverable skills whose boundary
is documentation lifecycle, not document type.

## Scope

The plugin contains exactly two skills:

- `repository-documentation:create` implements an authorized repository or
  project documentation system.
- `repository-documentation:maintain` maintains existing documentation so it
  remains current, curated, and evidence-backed after repository work.

The replacement package is created from the repository templates. Source
packages are reference material only. No file, instruction, asset, or example
is moved or mechanically merged from either retired package.

## Package Format and Distribution

The package uses the repository's current Codex compatibility contract:
`.codex-plugin/plugin.json` is its sole authored manifest, `skills` is exactly
`"./skills/"`, and the initial version is `0.1.0`. The manifest is created from
`templates/codex-plugin-plugin.json` and supplies every field required by
`schemas/plugin.schema.json`; undeclared optional components are removed.

This is an intentional compatibility constraint, not a claim that the
repository uses OpenAI's preferred portable package format for new plugins.
The current official guidance recommends a root `plugin.json` for newly
authored portable packages, while still supporting `.codex-plugin/plugin.json`
as a compatibility fallback. Migrating the repository's manifest model and
validators to portable packages is out of scope for this consolidation and
requires separate approval.

Compatibility basis: verified on 2026-09-11 against the official OpenAI
[Package your plugin](https://developers.openai.com/plugins/build/plugins#plugin-creator-output)
guidance and repository revision `5f7dee8a77d60e5a379bb259ca0a79dc054a90ce`.
That guidance describes root `plugin.json` as the portable format and
`.codex-plugin/plugin.json` as a supported compatibility fallback.

Consumers add the Codex Essentials repository/CLI marketplace and install
`repository-documentation@codex-essentials`. The generated catalog's
`./plugins/repository-documentation` path is repository build metadata, not a
consumer-local-only distribution model. This work does not submit the package
to the universal public Plugins Directory; that is a separate portal workflow
with additional developer-verification and review requirements.

No compatibility alias, shim, or deprecation period is provided. The user has
confirmed that no third party has installed either retired package. Git history
remains the recovery path.

## Skill Contracts

Each skill has a focused `SKILL.md` with an explicit trigger, expected inputs,
ordered workflow, user-visible output, evidence boundaries, stop conditions,
and named supporting resources. Detailed policy and template material stays in
the owning skill's `references/` or `assets/` directory, which `SKILL.md`
loads only when relevant.

### Create

`create` creates or implements only explicitly authorized documentation.

Its `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`.
Users must explicitly invoke `repository-documentation:create` before it can
start this workflow.

- Inspect repository instructions, current documents, evidence, and tooling.
- Inventory existing records and identify only supported documentation gaps.
- Propose the exact artifact set and resulting tree for material system work.
- Require explicit acceptance before creating, replacing, moving, or
  reorganizing material documentation.
- Create evidence-backed README, CHANGELOG, LICENSE, CODE OF CONDUCT, ADR,
  pending-debt, resolved-debt, index, structure, or template artifacts only
  when they are accepted and needed.
- Treat bundled templates as coverage maps and remove unsupported content.

The default output before acceptance is a read-only evidence report and the
proposed artifact tree. `create` does not claim that every repository requires
every document. It does not publish, tag, commit, push, create pull requests,
or mutate remote state.

### Maintain

`maintain` maintains existing in-scope documentation after completed work or an
explicit request to audit, curate, reconcile, or refresh it.

Its `agents/openai.yaml` sets `policy.allow_implicit_invocation: true` so
documentation-maintenance requests can discover it. An audit-only request is
read-only. A request to edit must identify the approved document scope; when
the scope is ambiguous, `maintain` stops with the evidence report and requests
clarification rather than choosing files to change.

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

## Source Mapping and Documentation Products

The retired packages are evidence sources, not copy sources. Before authoring
the replacement, the implementation plan maps each retained behavior to one
of `create`, `maintain`, a repository template, or an intentional omission.
The map must account for DocKeeper's changelog and ADR maintenance guidance and
Repository Maintenance's repository, plugin, debt, ADR, license, and agent
metadata templates. It must explain why every omitted source artifact is not
needed by either lifecycle workflow.

New package documentation starts from the matching repository templates:
`templates/codex-plugin-plugin.json`, `templates/agents-openai.yaml`,
`templates/plugin-README-reusable-template.md`,
`templates/CHANGELOG-reusable-template.md`, and
`templates/LICENSE-reusable-template.md`. The package README must retain every
section required by the repository marketplace contract and describe the two
skills' distinct triggers, writes, approvals, installation behavior, rollback,
verification, limitations, and recovery.

## Retirement and Integration

After the new package validates, remove `plugins/doc-keeper` and
`plugins/repo-maintenance`. Replace their active references in manifests,
catalog generation inputs, Release Please configuration and state, README,
release notes, tests, fixtures, and current documentation.

Historical Git commits preserve the prior package state. Current documentation
must not retain dangling links or operational references to retired paths.

## Acceptance Criteria

- The new package is schema-valid and self-contained.
- Its sole authored manifest is `.codex-plugin/plugin.json`, is version
  `0.1.0`, declares only `"./skills/"`, and contains all required template and
  schema fields.
- The package contains exactly `create` and `maintain`; each has exactly one
  valid `agents/openai.yaml`, a concise lifecycle-specific description, and
  the specified implicit-invocation policy.
- Every skill contract defines its trigger, inputs, outputs, evidence limits,
  approval boundary, stop condition, and supporting-resource loading rule.
- The source mapping covers every retained or intentionally omitted behavior
  and template from both retired packages.
- All created repository artifacts are English.
- The README has every required marketplace section and accurately describes
  package components, permissions, side effects, installation, rollback, and
  verification.
- The generated marketplace contains the replacement and excludes both retired
  plugins.
- Release Please components and state exactly match remaining plugin paths.
- No active catalog, release, root README, test fixture, template, or
  documentation reference points to either retired plugin.
- Tests cover direct, indirect, incomplete, out-of-scope, and evidence-safety
  requests for each skill, including `create`'s approval gate and
  `maintain`'s ambiguous-scope stop condition.
- The implementation runs `npm run marketplace:build`,
  `npm run marketplace:check`, `npm run validate:release-contract`,
  `npm run documentation:gate -- --base <base> --head <head>`,
  `npm run check`, and `git diff --check` with fresh output.
- The implementation does not introduce root `plugin.json` or public-directory
  submission artifacts; those require a separately approved portability or
  publication effort.
- No commit, push, tag, publication, pull request, release, merge, or remote
  configuration change is performed.
