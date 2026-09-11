# Changelog

All notable changes to Block No Verify are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Add the `block-no-verify` skill for approval-gated installation of a Codex Git verification and signing bypass policy.
- Bundle self-contained Python, project/user hook-configuration, and Bash maintenance-test templates without registering an active plugin hook.

### Security

- Require explicit scope selection and user-controlled `/hooks` review before a generated non-managed hook can affect supported Bash tool calls.

## [0.2.1](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/block-no-verify/v0.2.0...plugin/block-no-verify/v0.2.1) (2026-09-11)

### Changed

- Normalize the bundled Python handler for deterministic Ruff lint and format checks.
- Refactor the bundled Python command parser into bounded helpers so strict
  Ruff complexity checks pass without changing bypass-policy behavior.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/block-no-verify/v0.1.0...plugin/block-no-verify/v0.2.0) (2026-09-11)

### Features

- **block-no-verify:** add approval-gated Git bypass policy ([#76](https://github.com/nerymurillohnd/codex-essentials/issues/76)) ([77b24b8](https://github.com/nerymurillohnd/codex-essentials/commit/77b24b82231554f2cb7ce7eb36a01b6f5569e682))

### Bug Fixes

- **quality:** enforce staged shell and Python checks ([dd6f34a](https://github.com/nerymurillohnd/codex-essentials/commit/dd6f34a5e75047a9bd3a57ae9f8e8c504e7a1195))
- **quality:** preserve staged Python modes ([37b35ee](https://github.com/nerymurillohnd/codex-essentials/commit/37b35ee4554d580e1709090c98f1169c107ab6e5))
