# Changelog

All notable changes to this plugin are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/astro-cli-commands/v0.1.1...plugin/astro-cli-commands/v0.2.0) (2026-09-08)

### Features

- **agent-manifests:** require automatic invocation policy ([8c1f53a](https://github.com/nerymurillohnd/codex-essentials/commit/8c1f53ad3029cf907b7e882e4ee1fab2a3396e35))
- **ci:** adopt Release Please manifest releases ([a43b887](https://github.com/nerymurillohnd/codex-essentials/commit/a43b887de76732e0558e4890e2bbe09051be13af))
- enforce plugin marketplace pipeline ([2b6f6eb](https://github.com/nerymurillohnd/codex-essentials/commit/2b6f6ebc0d6b1832c6bd242d0773373106657698))
- enforce plugin marketplace pipeline ([7f54439](https://github.com/nerymurillohnd/codex-essentials/commit/7f5443989d23751378a25d2db7d736d0acf65872))
- establish declarative plugin source ([f601d43](https://github.com/nerymurillohnd/codex-essentials/commit/f601d43939c71e649c075bf432d7e82ba8b4db9c))
- establish declarative plugin source ([1b6875d](https://github.com/nerymurillohnd/codex-essentials/commit/1b6875d73faee52c19c8e590d4cce338a8aadc17))
- **prettier-after-edit:** lint Markdown after formatting ([a1cec2f](https://github.com/nerymurillohnd/codex-essentials/commit/a1cec2f722ecef6654dd28a0048fbc75ec186128))

### Bug Fixes

- address marketplace review findings ([de32626](https://github.com/nerymurillohnd/codex-essentials/commit/de32626452689b73567226444e30b7796b63bd2a))
- **ci:** rerun release gates on PR metadata changes ([78f4994](https://github.com/nerymurillohnd/codex-essentials/commit/78f499461902efeb2ffc6d37f1daf69bcaedcff5))
- scope documentation credential checks ([840e1ae](https://github.com/nerymurillohnd/codex-essentials/commit/840e1aedec55dcca39e322e44421216bc9eb24a5))

## [Unreleased]

### Changed

- **[Area: Agent]** Declare the skill's automatic invocation policy explicitly
  so the package conforms to the marketplace agent-manifest contract.
- **[Area: Skill]** Refined the bundled skill frontmatter description to focus
  implicit invocation on Astro CLI-dependent work and removed unsupported
  `disable-model-invocation` metadata.
- **[Area: Packaging]** Derived plugin and agent metadata from the repository
  plugin manifest and strengthened package validation to reject incomplete skill
  metadata, unsafe links, and resources resolving outside this package.
- **[Area: Manifest]** Recorded the complete author, legal, interface, and
  component metadata in `.codex-plugin/plugin.json`; the marketplace entry is
  now generated and reverse-validated from that manifest.
- **[Area: Documentation]** Updated the published Astro patch reference to
  7.2.9 while preserving installed-CLI verification as the authoritative
  compatibility check.
- **[Area: Documentation]** Clarified the current Codex lifecycle-hook contract,
  including explicit manifest paths and conventional `hooks/hooks.json`
  discovery.
- **[Area: Documentation]** Updated the GitHub Actions example to the Node
  24-compatible `actions/setup-node@v7` action.
- **[Area: Documentation]** Labeled the illustrative `astro info` output fence
  as plain text so Markdown linting and rendered documentation agree.

### Added

- **[Area: Packaging]** Added the MIT license terms to the standalone plugin
  package and documented the license as a distributed component.

## [0.1.1] - 2026-08-27

### Added

- **[Area: Agent]** Added the schema-validated Codex agent manifest at
  `skills/astro-commands/agents/openai.yaml` with the skill's catalog label,
  concise description, and default invocation prompt.

### Changed

- **[Area: Documentation]** Documented the agent manifest as a bundled
  component and reference, including its distinction from behavioral skill
  instructions.

## [0.1.0] - 2026-08-27

### Added

- **[Area: Manifest]** Added the initial Astro Commandments plugin manifest for
  marketplace discovery while retaining `astro-cli-commands` as the stable
  installation identifier.
- **[Area: Skill]** Added guidance for Astro CLI command selection, version
  verification, package-manager alignment, CI checks, background server
  handling, and secret-sensitive commands.
- **[Area: Installation]** Registered the plugin in the Codex Essentials
  marketplace as an available local plugin.
- **[Area: Documentation]** Documented the command-first decision rule and
  version-drift maintenance contract.
- **[Area: Documentation]** Clarified that the repository-owned
  `npm run check` command is the canonical contributor validation, with
  `npm run validate:plugins` for package validation and
  `npm run marketplace:check` for catalog drift. The external
  `plugin-creator` compatibility checker remains optional and maintainer-only.
  Documented asking Codex to invoke that Skill as the preferred user
  experience.
- **[Area: Documentation]** Added official Astro documentation, repository,
  installation, and release-note links with attribution and source precedence.
- **[Area: Documentation]** Added human-facing visual hierarchy and section
  icons to the product README while keeping operational agent instructions
  unchanged.
- **[Area: Documentation]** Removed maintainer-only local authoring commands
  from the public product and marketplace README guidance.
- **[Area: Documentation]** Distinguished the full contributor check from the
  repository's manifest-only validation commands.

### Changed

- **[Area: Manifest]** Renamed the visible product and Skill from Astro
  Commandments to Astro Commands; the `astro-cli-commands` installation ID is
  unchanged for compatibility.

[unreleased]: https://github.com/nerymurillohnd/codex-essentials/compare/HEAD...HEAD
