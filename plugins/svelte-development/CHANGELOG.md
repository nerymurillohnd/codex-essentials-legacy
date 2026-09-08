# Changelog

All notable changes to Svelte Development are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/svelte-development/v0.1.2...plugin/svelte-development/v0.2.0) (2026-09-08)

### Features

- **agent-manifests:** require automatic invocation policy ([8c1f53a](https://github.com/nerymurillohnd/codex-essentials/commit/8c1f53ad3029cf907b7e882e4ee1fab2a3396e35))

### Bug Fixes

- **svelte-development:** load bundled remote MCP ([baa587c](https://github.com/nerymurillohnd/codex-essentials/commit/baa587c8eb76b6c2a2877c8d06f807cf287cdc1f))
- **svelte-development:** load bundled remote MCP ([ac47501](https://github.com/nerymurillohnd/codex-essentials/commit/ac4750147d9e6bf735f3b88a8282441757edf556))
- **svelte-development:** use documented MCP map ([791a9e9](https://github.com/nerymurillohnd/codex-essentials/commit/791a9e91bc38762876c1d74459e8a56871404654))
- **svelte-development:** use documented MCP map ([b6a53c6](https://github.com/nerymurillohnd/codex-essentials/commit/b6a53c6ac2579e0472c57262fd83e38598c90fc8))

## [Unreleased]

### Changed

- Declared automatic invocation explicitly for every bundled skill so the
  package conforms to the marketplace agent-manifest contract.
- Listed each bundled skill's `agents/openai.yaml` metadata in the README
  included components table.
- Refined all bundled skill frontmatter descriptions to make architecture,
  component, SvelteKit, and verification triggers more precise.
- Removed unsupported `disable-model-invocation` frontmatter from bundled
  skills.

## [0.1.2] - 2026-09-02

### Changed

- Use the documented direct server map in `.mcp.json` while preserving the
  verified remote Svelte MCP connection.

## [0.1.1] - 2026-09-02

### Fixed

- Load the bundled `svelte` remote MCP connection with the runtime-compatible
  HTTP server declaration when the plugin is installed and enabled.

## [0.1.0] - 2026-09-01

### Added

- Publish the first marketplace-ready package for Svelte 5 and SvelteKit
  development workflows.
