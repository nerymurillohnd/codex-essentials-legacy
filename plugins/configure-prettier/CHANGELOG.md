# Changelog

All notable changes to Configure Prettier will be documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/configure-prettier/v0.1.0...plugin/configure-prettier/v0.2.0) (2026-09-08)

### Features

- **marketplace:** add Prettier configuration plugin ([7a1d7b8](https://github.com/nerymurillohnd/codex-essentials/commit/7a1d7b8875b98125cf13310c19de7d1ad98fc43d))
- **marketplace:** add Prettier configuration plugin ([#35](https://github.com/nerymurillohnd/codex-essentials/issues/35)) ([c196734](https://github.com/nerymurillohnd/codex-essentials/commit/c1967346ca9984a911713c3297c8a67c39d5f94f))
- **prettier-after-edit:** lint Markdown after formatting ([a1cec2f](https://github.com/nerymurillohnd/codex-essentials/commit/a1cec2f722ecef6654dd28a0048fbc75ec186128))

## [Unreleased]

### Changed

- Clarified in the README that `.codex-plugin/plugin.json` is the authoritative
  plugin version source.
- Refined the bundled skill frontmatter description to start with its trigger
  condition and clarify approval-gated mutation boundaries.

### Added

- **[Area: Skill]** Added `configure-prettier`, an audit-first,
  repository-first, approval-gated skill for auditing, recommending,
  configuring, and maintaining Prettier.
- **[Area: Audit]** Added read-only discovery for repository/workspace
  structure, package managers, lockfiles, Prettier configuration, ignores,
  editor settings, source-control attributes, hooks, CI, and global tooling
  within an explicitly declared scope.
- **[Area: Quality]** Added proportionate assessment of Prettier plugins and
  adjacent quality tooling. Absent linters and formatters receive only a
  high-level assessment unless audit evidence establishes a concrete material
  gap.
- **[Area: Consistency]** Added CLI/IDE parity requirements so approved
  repository-local Prettier configuration, dependency resolution, ignores,
  parsers, and plugins are verified for both terminal and VS Code workflows.
- **[Area: Safety]** Added independently approvable recommendations with
  complete diffs or replacement files before any dependency, configuration,
  script, editor, hook, CI, or formatting change.
- **[Area: References]** Added focused references for audit scope, convention
  resolution, quality integration, source verification, IDE/CLI parity,
  approval-gated implementation, recommendation reporting, and conditional
  templates.
- **[Area: Metadata]** Added Codex-facing `agents/openai.yaml` metadata for
  discoverability and invocation.
- **[Area: Packaging]** Added the package manifest and generated marketplace
  registration contract.

### Security

- **[Area: Authorization]** Explicit approval is required before installation,
  package or lockfile changes, source formatting, configuration writes,
  editor-setting changes, hooks, CI changes, or any external mutation.
- **[Area: Network]** Current official documentation, release notes, and package
  metadata are consulted only for read-only verification before a
  recommendation; no dependency or configuration is automatically updated.
- **[Area: Command safety]** Added command-safety classification and requires
  approval-plan inclusion for validation commands.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
