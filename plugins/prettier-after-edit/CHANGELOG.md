# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates
(`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.3.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/prettier-after-edit/v0.2.0...plugin/prettier-after-edit/v0.3.0) (2026-09-08)

### Features

- **agent-manifests:** require automatic invocation policy ([8c1f53a](https://github.com/nerymurillohnd/codex-essentials/commit/8c1f53ad3029cf907b7e882e4ee1fab2a3396e35))
- **agents:** validate Codex skill agent manifests ([ed366fe](https://github.com/nerymurillohnd/codex-essentials/commit/ed366feff0bf7c94c66e0889ab37c1c45f0797a4))
- **agents:** validate Codex skill agent manifests ([97daed0](https://github.com/nerymurillohnd/codex-essentials/commit/97daed08bcb94e3bafb9c4e063ca38e32b576db6))
- **ci:** adopt Release Please manifest releases ([a43b887](https://github.com/nerymurillohnd/codex-essentials/commit/a43b887de76732e0558e4890e2bbe09051be13af))
- enforce plugin marketplace pipeline ([2b6f6eb](https://github.com/nerymurillohnd/codex-essentials/commit/2b6f6ebc0d6b1832c6bd242d0773373106657698))
- enforce plugin marketplace pipeline ([7f54439](https://github.com/nerymurillohnd/codex-essentials/commit/7f5443989d23751378a25d2db7d736d0acf65872))
- establish declarative plugin source ([f601d43](https://github.com/nerymurillohnd/codex-essentials/commit/f601d43939c71e649c075bf432d7e82ba8b4db9c))
- establish declarative plugin source ([1b6875d](https://github.com/nerymurillohnd/codex-essentials/commit/1b6875d73faee52c19c8e590d4cce338a8aadc17))
- **plugin:** add prettier-after-edit plugin to marketplace ([83e5949](https://github.com/nerymurillohnd/codex-essentials/commit/83e594994671137292feaeb0924317c5af6cf7e2))
- **plugin:** add prettier-after-edit plugin to marketplace ([99d420d](https://github.com/nerymurillohnd/codex-essentials/commit/99d420d8b1a7c692ca60d0fca707337b86a12a04))
- **prettier-after-edit:** lint Markdown after formatting ([a1cec2f](https://github.com/nerymurillohnd/codex-essentials/commit/a1cec2f722ecef6654dd28a0048fbc75ec186128))

### Bug Fixes

- address marketplace review findings ([de32626](https://github.com/nerymurillohnd/codex-essentials/commit/de32626452689b73567226444e30b7796b63bd2a))
- **ci:** rerun release gates on PR metadata changes ([78f4994](https://github.com/nerymurillohnd/codex-essentials/commit/78f499461902efeb2ffc6d37f1daf69bcaedcff5))
- **plugin:** emit explicit skip messages in prettier hook ([0bd3f39](https://github.com/nerymurillohnd/codex-essentials/commit/0bd3f393a33214e2df78db4c548f3eae9819da7c))
- **prettier-after-edit:** make hook root resolution Codex-first ([a21dce5](https://github.com/nerymurillohnd/codex-essentials/commit/a21dce5df90a542bf0bc82db5a8a1cd7bb170619))
- **prettier-after-edit:** parse apply_patch freeform payload ([efe437e](https://github.com/nerymurillohnd/codex-essentials/commit/efe437e20385687da40f921a865bfd67a15d6835))
- **prettier-after-edit:** run only prettier after edits ([a914d03](https://github.com/nerymurillohnd/codex-essentials/commit/a914d03077ba8d90257481ec7049e73da1f52d41))
- **prettier-after-edit:** run only prettier after edits ([47b68f0](https://github.com/nerymurillohnd/codex-essentials/commit/47b68f00411b6f8697377869839034c9a0174bb4))
- scope documentation credential checks ([840e1ae](https://github.com/nerymurillohnd/codex-essentials/commit/840e1aedec55dcca39e322e44421216bc9eb24a5))

## [Unreleased]

### Changed

- **[Area: Agent]** Declare the skill's automatic invocation policy explicitly
  so the package conforms to the marketplace agent-manifest contract.
- **[Area: Skill]** Refined the bundled skill frontmatter description to
  distinguish immediate post-edit formatting from Prettier configuration work.
- **[Area: Packaging]** Derived plugin and agent metadata from the repository
  plugin manifest and strengthened package validation to reject incomplete skill
  metadata, unsafe links, and resources resolving outside this package.
- **[Area: Manifest]** Added the explicit `hooks` declaration and recorded the
  complete author, legal, interface, and component metadata; the marketplace
  entry is generated and reverse-validated from this manifest.
- **[Area: Runtime]** Accept `tool_response.filePath` in addition to existing
  direct input paths, prefer the nearest local Prettier for each target, and
  retain the PATH-visible global fallback without using `npx` or installing
  dependencies.
- **[Area: Runtime]** Replaced the Bash and jq hook with a self-contained Node
  orchestrator, increased the hook timeout to 60 seconds, and preserved
  project-local-first tool resolution with PATH fallback.
- **[Area: Product]** Restored the display name and documentation to describe
  Prettier-only behavior while retaining the `prettier-after-edit` installation
  identifier.

### Removed

- **[Area: Markdown]** Removed automatic markdownlint-cli2 execution from the
  edit hook; Markdown linting now remains the responsibility of the target
  repository's own scripts, hooks, editor integration, or CI.

### Fixed

- **[Area: Hook]** Replaced the invalid nested shell fallback in the packaged
  hook command with Codex's `${PLUGIN_ROOT}` contract, preventing startup
  failures with exit code `127`.
- **[Area: Hook]** Format every file reported by a multi-file `apply_patch`
  event, preserve paths containing spaces, and leave unreported files untouched.
- **[Area: Formatting]** Run Prettier from the target project with project-local
  paths so its configuration and ignore policy apply to explicit files.
- **[Area: Status]** Report `formatted` only when Prettier changes file bytes;
  distinguish unchanged, ignored, unsupported, and failed formatting outcomes.
- **[Area: Scope]** Reject missing, non-file, and outside-cwd targets and prevent
  a single edit event from widening into repository-wide formatting.
- **[Area: Skill]** Removed the unsupported `disable-model-invocation`
  frontmatter key so the distributed skill passes the current skill validator.

## [0.1.1] - 2026-08-27

### Added

- **[Area: Agent]** Added the schema-validated Codex agent manifest at
  `skills/prettier-after-edit/agents/openai.yaml` with the skill's catalog
  label, concise description, and default invocation prompt.

### Changed

- **[Area: Documentation]** Documented the agent manifest as a bundled
  component and reference, including its distinction from behavioral skill
  instructions.

## [0.1.0] - 2026-08-27

### Added

- **[Area: Manifest]** Added the `prettier-after-edit` plugin manifest with catalog
  identity, version, author metadata, capabilities, and default prompt.
- **[Area: Hook]** Added a `PostToolUse` hook that resolves Prettier with a
  project-local preference and global fallback.
- **[Area: Script]** Added resilient input parsing for direct file paths and
  first-match `apply_patch` file selection.
- **[Area: Documentation]** Added `README.md`, `SKILL.md`, `hooks.json`, and
  local package `LICENSE.md`.
- **[Area: Hooks]** Added installer-safe runtime package files for marketplace
  distribution and documentation.

### Changed

- **[Area: Compatibility]** Replaced single-path fallback behavior with explicit
  local-first/ global-fallback binary selection.
- **[Area: Packaging]** Added a full marketplace-compatible package structure and
  changelog/manifest synchronization entry.
- **[Area: Hook]** Updated hook invocation to use
  `"${CODEX_PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT:-$PLUGIN_ROOT}"` so packaged
  hooks resolve correctly in Codex plugin execution environments.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
