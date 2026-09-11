# Changelog

All notable changes to Block No Verify are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Add the `block-no-verify` skill for approval-gated installation of a Codex Git verification and signing bypass policy.
- Bundle self-contained Python, project/user hook-configuration, and Bash maintenance-test templates without registering an active plugin hook.

### Security

- Require explicit scope selection and user-controlled `/hooks` review before a generated non-managed hook can affect supported Bash tool calls.

### Changed

- Normalize the bundled Python handler for deterministic Ruff lint and format checks.
