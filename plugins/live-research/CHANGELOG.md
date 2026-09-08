# Changelog

All notable changes to Live Research are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/live-research/v0.1.0...plugin/live-research/v0.2.0) (2026-09-08)

### Features

- **live-research:** add marketplace plugin ([66cb31c](https://github.com/nerymurillohnd/codex-essentials/commit/66cb31c8f979d3dc6a21d1f056a6570dc5e749ca))
- **live-research:** add marketplace plugin ([#41](https://github.com/nerymurillohnd/codex-essentials/issues/41)) ([f81009c](https://github.com/nerymurillohnd/codex-essentials/commit/f81009c3522a015c453c5f5f7143df7b749eb585))

## [Unreleased]

### Changed

- Refactored the bundled skill into an explicit audit-ready workflow with
  required inputs, concrete use cases, source-routing steps, non-inference rules,
  ask/stop/decline conditions, output format, success criteria, and final
  validation checks.
- Updated the Codex-facing agent metadata and README to describe the strengthened
  live-evidence contract and package verification date.
- Clarified in the README that `.codex-plugin/plugin.json` is the authoritative
  plugin version source and listed the manifest in included components.
- Refined the bundled skill frontmatter description to focus implicit
  invocation on time-sensitive and change-sensitive facts.

### Added

- Package the Live Research skill as a self-contained Codex marketplace plugin
  with schema-valid agent metadata and installation documentation.
- Prefer callable specialized MCPs, plugins, apps, and standalone skills before
  generic retrieval, while preserving an independent fallback and verification
  workflow.
- Restore the explicit completion checklist in the primary skill document so
  evidence, source, conflict, and uncertainty controls remain visible at closeout.
- Consolidate the complete evidence, grounding, citation, and checklist protocol
  into one self-contained `SKILL.md` for portable community distribution.
