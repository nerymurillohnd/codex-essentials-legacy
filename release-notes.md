# Codex Essentials Release Notes

This document consolidates the current release notes for the 10 plugins in the
Git-backed marketplace. Versions are sourced from each plugin manifest.

## Astro Commands (`astro-cli-commands`)

Current manifest version: `0.1.1`

Astro Commands provides a command-first operating contract for Astro projects.
It uses the installed Astro CLI and the project's package manager as the source
of truth.

Highlights:

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

Configure Prettier introduces an audit-first plugin for repository-specific
Prettier setup and maintenance. It discovers the current repository, tooling,
editor, hook, CI, package-manager, and formatting context before recommending
any change.

Highlights:

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

DocKeeper strengthens its evidence-based changelog and ADR maintenance workflow.
The package now has complete marketplace manifest metadata and stricter release
history behavior while preserving existing changelog and ADR ownership.

Highlights:

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

## Live Research (`live-research`)

Current manifest version: `0.1.0`

Live Research packages a disciplined workflow for answering change-sensitive
questions with current, authoritative evidence. The current package tightens
that workflow and keeps the complete evidence protocol self-contained in one
distributed skill document.

Highlights:

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

Codex Memory Audit introduces an evidence-based workflow for auditing and
reconciling Codex memory artifacts across project and global scopes. It
separates inspection, proposed updates, approval, and application.

Highlights:

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

Prettier After Edit focuses the package on exact-file Prettier formatting after
Codex edits. The hook runtime was rebuilt as a self-contained Node
orchestrator, and Markdown linting was removed from the hook's automatic
responsibility.

Highlights:

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

Skill Design Standards provides a self-contained workflow for designing,
auditing, and evaluating portable Agent Skills.

Highlights:

- Added the packaged skill workflow and focused references for format, Codex
  metadata, script interfaces, descriptions, evaluation, and validation.
- Separated format requirements, design recommendations, and host-specific
  configuration guidance.
- Documented installation, standalone-skill migration, verification, and
  recovery boundaries.

Upgrade notes:

- No migration is required for a new installation.
- When replacing a standalone copy, preserve local changes and keep only one
  discoverable installation after verification.

## Prompt Architect (`prompt-architect`)

Current manifest version: `0.1.0`

Prompt Architect adds a self-contained prompt-authoring plugin for turning rough
intent into copy-ready prompts with risk, evidence, authority, output,
verification, and execution-topology controls.

Highlights:

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
- Removed stale migration helper, stale migration source document, and redundant
  skill-level README from the distributed package.

Upgrade notes:

- The plugin creates prompts; it does not execute them or modify target
  projects by itself.
- Hook support is required for automatic final-output validation.

## Svelte Development (`svelte-development`)

Current manifest version: `0.1.2`

Svelte Development provides Codex with a focused operating contract for serious
Svelte 5 and SvelteKit architecture, implementation, and verification work,
backed by the official remote Svelte MCP endpoint.

Highlights:

- First marketplace-ready package for Svelte 5 and SvelteKit workflows.
- Runtime-compatible remote Svelte MCP loading.
- Direct server map declaration in `.mcp.json`.
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

System Ops Audit introduces a local macOS baseline audit workflow that keeps
workspace preparation, baseline design, approved execution, and evidence
analysis behind separate approval boundaries.

Highlights:

- New marketplace plugin for read-only macOS operational baseline audit work.
- Normalized plugin manifest metadata, skill agent metadata, README sections,
  and MIT license terms.
- Workspace contract, safety policy, macOS baseline audit specification, script
  design template, test scenarios, and workspace tree asset.
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
