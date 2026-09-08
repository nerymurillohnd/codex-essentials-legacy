# Codex Essentials Release Notes

This document summarizes the 12 plugins in the [Git-backed marketplace](.agents/plugins/marketplace.json).
Snapshot: 2026-09-07, based on repository revision `f626229`.

Manifest versions identify the current package metadata; they do not prove that
the changes below have been released. Each plugin's linked changelog owns its
versioned history and `Unreleased` entries. Unless explicitly labeled as
versioned history, highlights below summarize `Unreleased` changes.

Installations use the repository's `main` catalog, which can include these
pending changes. For published release records, consult
[GitHub Releases](https://github.com/nerymurillohnd/codex-essentials/releases).

## Astro Commands (`astro-cli-commands`)

Current manifest version: `0.1.1`

Sources: [Manifest](plugins/astro-cli-commands/.codex-plugin/plugin.json) ·
[Changelog](plugins/astro-cli-commands/CHANGELOG.md).
Latest versioned changelog entry: `0.1.1` (2026-08-27).

Astro Commands provides a command-first operating contract for Astro projects.
It uses the installed Astro CLI and the project's package manager as the source
of truth.

Unreleased highlights:

- Refined skill trigger metadata for Astro CLI-dependent work.
- Stronger package validation for skill metadata, unsafe links, and package
  containment.
- Documentation refreshes for Astro patch references, Codex hook behavior,
  Node 24-compatible GitHub Actions examples, and Markdown rendering.
- MIT license terms added to the standalone package.

Upgrade notes:

- No migration is required for existing users.
- The installed project's Astro CLI and package manager remain authoritative
  over static reference snapshots.

## Configure Prettier (`configure-prettier`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/configure-prettier/.codex-plugin/plugin.json) ·
[Changelog](plugins/configure-prettier/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Configure Prettier introduces an audit-first plugin for repository-specific
Prettier setup and maintenance. It discovers the current repository, tooling,
editor, hook, CI, package-manager, and formatting context before recommending
any change.

Unreleased highlights:

- New approval-gated skill for auditing, recommending, configuring, and
  maintaining Prettier.
- Read-only discovery across repository structure, package managers, lockfiles,
  Prettier configuration, ignores, editor settings, source-control attributes,
  hooks, CI, and global tooling.
- CLI and IDE parity checks for repository-local Prettier resolution.
- Evidence-backed recommendations with complete diffs or replacement files
  before mutation.
- Codex-facing agent metadata and generated marketplace registration.
- README clarification that `.codex-plugin/plugin.json` is the version source.

Upgrade notes:

- No automatic formatting, dependency installation, lockfile changes, CI
  changes, or editor-setting changes occur without explicit approval.
- Current official documentation and registry metadata are checked only as
  read-only verification inputs before recommendations.

## DocKeeper (`doc-keeper`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/doc-keeper/.codex-plugin/plugin.json) ·
[Changelog](plugins/doc-keeper/CHANGELOG.md).
Latest versioned changelog entry: `0.1.0` (2026-08-28).

DocKeeper strengthens its evidence-based changelog and ADR maintenance workflow.
The package now has complete marketplace manifest metadata and stricter release
history behavior while preserving existing changelog and ADR ownership.

Unreleased highlights:

- Explicit automatic invocation policy in the bundled agent metadata.
- More precise skill routing for changelog, release-history, and ADR work.
- Complete author, legal, interface, and component metadata in the plugin
  manifest.
- Deterministic prerelease chronology and stable-promotion behavior.
- Clearer semantic-release lifecycle boundaries, including what
  `@semantic-release/github` does and does not own.
- New changelog guidance to omit empty change-type sections while preserving
  canonical section order.

Upgrade notes:

- No remote publication, tag, release, PR, or ADR mutation is performed by the
  plugin unless separately authorized.
- Existing local changelog and ADR conventions continue to take precedence.

## Hook Creator (`hook-creator`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/hook-creator/.codex-plugin/plugin.json) ·
[Changelog](plugins/hook-creator/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Hook Creator packages focused guidance for designing, implementing, integrating,
reviewing, testing, and debugging Codex lifecycle hooks.

Unreleased highlights:

- New skill with focused references for event selection, configuration,
  command/MCP/background handlers, input/output contracts, and debugging.
- Guidance for existing-hook composition, managed hooks, plugin bundling,
  subagents, CI/CD, and GitHub Actions.
- Source traceability to official hook documentation and commit-pinned schemas,
  implementation, and tests.

Upgrade notes:

- The package ships no active hooks, MCP servers, or apps and requires no
  credentials to use its bundled knowledge.
- Installing the plugin does not activate or trust hooks. Generated definitions
  require review and user-controlled trust before activation.

## Live Research (`live-research`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/live-research/.codex-plugin/plugin.json) ·
[Changelog](plugins/live-research/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Live Research packages a disciplined workflow for answering change-sensitive
questions with current, authoritative evidence. The current package tightens
that workflow and keeps the complete evidence protocol self-contained in one
distributed skill document.

Unreleased highlights:

- Explicit audit-ready workflow with inputs, use cases, source routing,
  non-inference rules, ask/stop/decline conditions, output requirements,
  success criteria, and final validation checks.
- Callable specialized MCPs, plugins, apps, and standalone skills are preferred
  before generic retrieval when available.
- Restored completion checklist for evidence, source, conflict, and uncertainty
  controls.
- Updated agent metadata and README for the strengthened live-evidence contract.
- README clarification that `.codex-plugin/plugin.json` is the version source.

Upgrade notes:

- No migration is required for existing users.
- Network-backed retrieval remains read-only unless a separate task explicitly
  authorizes another effect.

## Codex Memory Audit (`optimize-memories`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/optimize-memories/.codex-plugin/plugin.json) ·
[Changelog](plugins/optimize-memories/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Codex Memory Audit introduces an evidence-based workflow for auditing and
reconciling Codex memory artifacts across project and global scopes. It
separates inspection, proposed updates, approval, and application.

Unreleased highlights:

- New `audit-and-cure-memories` skill with phase-gated project, global, and
  complete memory-audit workflows.
- Plugin manifest with marketplace identity, version, author metadata,
  capabilities, and default prompt.
- Codex-facing agent metadata, package README, MIT license, and changelog.
- Clarified use of official sources for Codex-behavior corrections and local
  authority for project-specific corrections.
- Updated marketplace refresh guidance to the supported
  `codex plugin marketplace upgrade` command.

Upgrade notes:

- Memory edits remain approval-gated; audit and reporting are read-only until a
  consolidated change set is explicitly approved.
- No credentials are required for local memory inspection.

## Prettier After Edit (`prettier-after-edit`)

Current manifest version: `0.2.0`

Sources: [Manifest](plugins/prettier-after-edit/.codex-plugin/plugin.json) ·
[Changelog](plugins/prettier-after-edit/CHANGELOG.md).
Latest versioned changelog entry: `0.1.1` (2026-08-27). The manifest's `0.2.0`
does not yet have a versioned changelog entry; the changes below remain under
`Unreleased`.

Prettier After Edit focuses the package on exact-file Prettier formatting after
Codex edits. The hook runtime was rebuilt as a self-contained Node
orchestrator, and Markdown linting was removed from the hook's automatic
responsibility.

Unreleased highlights:

- Explicit automatic invocation policy in the bundled agent metadata.
- Explicit hook declaration in the plugin manifest.
- Self-contained Node hook that accepts direct paths, multi-file `apply_patch`
  reports, and `tool_response.filePath`.
- Project-local Prettier resolution first, with PATH fallback and no `npx` or
  dependency installation.
- Distinct `formatted`, `unchanged`, `ignored`, `unsupported`, and failed
  outcomes.
- Scope protections for missing, non-file, outside-cwd, and symlink-escape
  targets.
- Invalid nested shell fallback replaced with the Codex `${PLUGIN_ROOT}`
  contract.
- Automatic Markdown linting removed from the edit hook.

Upgrade notes:

- Users who depended on automatic markdownlint execution should run their
  repository's own Markdown lint scripts or hooks.
- The hook may write Prettier output for reported edited files when enabled.

## Skill Design Standards (`skill-design-standards`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/skill-design-standards/.codex-plugin/plugin.json) ·
[Changelog](plugins/skill-design-standards/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Skill Design Standards provides a self-contained workflow for designing,
auditing, and evaluating portable Agent Skills.

Unreleased highlights:

- Added the packaged skill workflow and focused references for format, Codex
  metadata, script interfaces, descriptions, evaluation, and validation.
- Separated format requirements, design recommendations, and host-specific
  configuration guidance.
- Documented installation, standalone-skill migration, verification, and
  recovery boundaries.
- Made host-provided creator tools optional and removed reliance on a
  machine-local creator reference or validator.

Upgrade notes:

- No migration is required for a new installation.
- When replacing a standalone copy, preserve local changes and keep only one
  discoverable installation after verification.

## Prompt Architect (`prompt-architect`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/prompt-architect/.codex-plugin/plugin.json) ·
[Changelog](plugins/prompt-architect/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Prompt Architect adds a self-contained prompt-authoring plugin for turning rough
intent into copy-ready prompts with risk, evidence, authority, output,
verification, and execution-topology controls.

Unreleased highlights:

- New marketplace plugin with a risk-calibrated prompt-authoring skill.
- Codex-facing skill metadata and marketplace registration.
- Packaged references, templates, examples, domain procedures, validation, and
  delivery gates.
- Conditional `/goal` guidance for long-running Codex tasks.
- Packaged `Stop` hook and deterministic final-output validator.
- Progressive support-file routing instead of loading the full prompt canon for
  every task.
- Validator fixes for nested headings, wrapper heading case, and block-reason
  continuation behavior.
- Stricter validation of malformed `Ready` and `Needs Clarification` responses,
  including missing required prompt sections.
- Removed stale migration helper, stale migration source document, and redundant
  skill-level README from the distributed package.

Upgrade notes:

- The plugin creates prompts; it does not execute them or modify target
  projects by itself.
- Hook support is required for automatic final-output validation.

## Repository Maintenance (`repo-maintenance`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/repo-maintenance/.codex-plugin/plugin.json) ·
[Changelog](plugins/repo-maintenance/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

Repository Maintenance provides an evidence-based workflow for repository
documentation and maintenance records using adaptable templates.

Unreleased highlights:

- New skill and templates for repository and plugin READMEs, changelogs, ADRs,
  pending/resolved debt, MIT license notices, and conditional Codex metadata.
- Read-only audit and structure proposals before document creation, with
  explicit selection of the proposal and document set before writing.
- Document-specific routing, preservation of accepted ADR history, and
  evidence requirements for debt resolution.
- Optional offers to add repository instructions or save durable documentation
  conventions to memory, only with explicit approval.

Upgrade notes:

- Existing repository conventions guide template adaptation; unsupported or
  empty template sections should be omitted.
- The skill does not select a license, invent missing evidence, or perform
  commits, pushes, releases, or other remote mutations.

## Svelte Development (`svelte-development`)

Current manifest version: `0.1.2`

Sources: [Manifest](plugins/svelte-development/.codex-plugin/plugin.json) ·
[Changelog](plugins/svelte-development/CHANGELOG.md).
Latest versioned changelog entry: `0.1.2` (2026-09-02).

Svelte Development provides Codex with a focused operating contract for serious
Svelte 5 and SvelteKit architecture, implementation, and verification work,
backed by the official remote Svelte MCP endpoint.

Versioned changelog history:

- `0.1.0` (2026-09-01): First marketplace-ready package for Svelte 5 and
  SvelteKit workflows.
- `0.1.1` (2026-09-02): Runtime-compatible remote Svelte MCP loading.
- `0.1.2` (2026-09-02): Direct server map declaration in `.mcp.json`.

Unreleased highlights:

- Explicit automatic invocation policy for every bundled skill.
- README now lists each bundled skill's `agents/openai.yaml` metadata.
- Refined architecture, component, SvelteKit, and verification triggers.
- Removed unsupported skill frontmatter from bundled skills.

Upgrade notes:

- The bundled MCP configuration may send framework questions and selected
  source snippets to the official remote Svelte MCP endpoint; do not send
  secrets or private credentials.
- Current project dependencies, lockfiles, and live Svelte documentation remain
  authoritative.

## System Ops Audit (`system-ops-audit`)

Current manifest version: `0.1.0`

Sources: [Manifest](plugins/system-ops-audit/.codex-plugin/plugin.json) ·
[Changelog](plugins/system-ops-audit/CHANGELOG.md).
Changelog status: `Unreleased` only; no versioned entry yet.

System Ops Audit introduces a local macOS baseline audit workflow that keeps
workspace preparation, baseline design, approved execution, and evidence
analysis behind separate approval boundaries.

Unreleased highlights:

- New marketplace plugin for read-only macOS operational baseline audit work.
- Normalized plugin manifest metadata, skill agent metadata, README sections,
  and MIT license terms.
- Workspace contract, safety policy, macOS baseline audit specification, script
  design template, and test scenarios.
- Mode-specific workflow for workspace, design, writing, execution, and
  analysis.
- Proportionate audit coverage tiers and an evidence model requiring
  version-sensitive behavior to be verified.
- Removed duplicated workspace-tree asset; the workspace contract is now the
  authoritative layout source.
- Documentation clarifies local-machine scope, privacy exclusions, and
  current-source precedence.

Upgrade notes:

- The package intentionally ships no executable audit collector script.
- Baseline collection is observation, not repair; script creation, command
  execution, collection, and remediation require separate explicit approvals.
