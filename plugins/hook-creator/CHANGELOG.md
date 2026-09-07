# Changelog

All notable changes to Hook Creator are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601 dates (`YYYY-MM-DD`) and keep
entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Package Hook Creator as a community plugin with bundled hook-design knowledge and no active
  lifecycle hooks, MCP servers, apps, or credential requirements.
- Add a concise operating skill that routes hook design, implementation, integration, review,
  testing, and debugging to focused knowledge references.
- Cover all 12 released Codex hook events, JSON/TOML configuration, command/MCP/background handlers,
  stdin/stdout contracts, trust, managed hooks, existing-hook composition, plugin bundling,
  subagents, CI/CD, and GitHub Actions.
- Add source traceability to the complete published Hooks page and commit-pinned official schemas,
  implementation, and tests.

### Security

- Require explicit review and user-controlled trust before hook activation, minimize sensitive
  event/output data, and distinguish hooks from sandbox, approval, managed-policy, and CI controls.
