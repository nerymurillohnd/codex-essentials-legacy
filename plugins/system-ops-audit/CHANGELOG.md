# Changelog

All notable changes to System Ops Audit are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/system-ops-audit/v0.1.0...plugin/system-ops-audit/v0.2.0) (2026-09-08)

### Features

- **system-ops-audit:** add macos baseline audit plugin ([563005d](https://github.com/nerymurillohnd/codex-essentials/commit/563005da38a9c8857064e7a33c269920ffee83c5))

## [Unreleased]

### Changed

- Refactored the bundled skill into explicit workspace, design, writing,
  execution, and analysis modes with mode-specific inputs, approval boundaries,
  outputs, and stop conditions.
- Replaced the monolithic macOS audit checklist with proportionate coverage
  tiers and an evidence model that requires version-sensitive behavior to be
  verified rather than inferred.
- Removed the duplicated workspace-tree asset; the workspace contract is now
  the single authoritative source for the fixed layout.
- Refined skill metadata and package documentation to clarify local-machine
  scope, privacy exclusions, and current-source precedence.

### Added

- Import the System Ops Audit skill as a Codex Essentials marketplace plugin.
- Normalize plugin manifest metadata, skill agent metadata, README sections, and
  license terms to the Codex Essentials marketplace templates.
- Add workspace contract, safety policy, macOS baseline audit specification,
  script design template, test scenarios, and workspace tree asset.
- Document that the package intentionally ships without executable audit
  collector scripts.
