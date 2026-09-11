# Changelog

All notable changes to Configure Ruff After Edit are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Add a skills-only Ruff after-edit configuration workflow with a read-only,
  approval-gated project or user scope boundary.
- Add an inert package contract that prohibits an active plugin hook.
- Add the manifest, skill, inert consumer templates, progressive references,
  package documentation, and root marketplace discovery for the workflow.
- Document the safety boundary: the initial generated handler does not execute
  uv and safely skips projects whose only Ruff route is uv.
