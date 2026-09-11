# Changelog

All notable changes to Configure Ruff After Edit are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/ruff-after-edit/v0.1.0...plugin/ruff-after-edit/v0.2.0) (2026-09-11)

### Features

- **ruff-after-edit:** add consumer-owned Ruff workflow ([d3da263](https://github.com/nerymurillohnd/codex-essentials/commit/d3da263e9ca0b714ec4bf32de6d66bf7b933ec06))

## [Unreleased]

### Added

- Add a skills-only Ruff after-edit configuration workflow with a read-only,
  approval-gated project or user scope boundary.
- Add an inert package contract that prohibits an active plugin hook.
- Add the manifest, skill, inert consumer templates, progressive references,
  package documentation, and root marketplace discovery for the workflow.
- Document the safety boundary: the initial generated handler does not execute
  uv and safely skips projects whose only Ruff route is uv.

### Fixed

- Replace the rejected Python handler with Node.js/POSIX templates, including
  explicit strict-profile hook templates and consumer-owned configuration paths.
- Reject packaged or otherwise non-consumer `--config` paths and deduplicate
  canonical edited-file targets before running Ruff.
