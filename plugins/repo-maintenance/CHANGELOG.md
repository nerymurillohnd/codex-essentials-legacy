# Changelog

All notable changes to Repository Maintenance are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/repo-maintenance/v0.1.0...plugin/repo-maintenance/v0.2.0) (2026-09-08)

### Features

- **plugins:** add hook creator and repo maintenance ([e558763](https://github.com/nerymurillohnd/codex-essentials/commit/e5587632626d844655da9b2a27c983c87d55194b))

## [Unreleased]

### Added

- Added the `repo-maintenance` skill for evidence-based repository documentation and maintenance-record upkeep.
- Added reusable ADR, pending-debt, resolved-debt, changelog, README, MIT license, and conditional Codex metadata templates.
- Added explicit boundaries for local edits, missing evidence, licensing decisions, and remote mutations.

### Changed

- Added an optional post-maintenance `AGENTS.md` instruction offer for a
  repository-local pre-commit documentation-maintenance reminder.
- Added the post-maintenance memory offer so users can explicitly choose
  whether durable repository documentation conventions should be remembered.
- Refactored the skill contract to route requests by document type and select
  the appropriate asset template for repository READMEs, plugin/package READMEs,
  changelogs, ADRs, debt ledgers, licenses, and Codex skill metadata.
- Clarified that bundled templates are adaptable coverage maps, not forms that
  must be completed in full.
- Folded the operating-model guidance into the skill contract to reduce
  reference overhead and keep proposal output in one place.
- Added a read-only audit and proposal phase with portable-baseline and repository-aligned structures before any directory or document is created.
- Require explicit selection of the proposal and document set, with a custom-structure path when neither proposal fits.
- Added lifecycle guidance for accepted records, evidence-based debt resolution, ADR history, and prevention of parallel documentation systems.
- Established root `docs/` with `docs/decisions/` and `docs/maintenance/` as the recommended default structure, based on this repository's maintained documentation convention.
