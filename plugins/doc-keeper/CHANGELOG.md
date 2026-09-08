# Changelog

All notable changes to DocKeeper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/doc-keeper/v0.1.0...plugin/doc-keeper/v0.2.0) (2026-09-08)

### Features

- add DocKeeper plugin ([c4cf62d](https://github.com/nerymurillohnd/codex-essentials/commit/c4cf62d2b129d8b441fb6788fe849ac33975d5e3))
- add DocKeeper plugin ([c55b540](https://github.com/nerymurillohnd/codex-essentials/commit/c55b5407a3f436dd6034527409143ed3e496cb2a))
- **agent-manifests:** require automatic invocation policy ([8c1f53a](https://github.com/nerymurillohnd/codex-essentials/commit/8c1f53ad3029cf907b7e882e4ee1fab2a3396e35))
- enforce plugin marketplace pipeline ([2b6f6eb](https://github.com/nerymurillohnd/codex-essentials/commit/2b6f6ebc0d6b1832c6bd242d0773373106657698))
- enforce plugin marketplace pipeline ([7f54439](https://github.com/nerymurillohnd/codex-essentials/commit/7f5443989d23751378a25d2db7d736d0acf65872))
- **prettier-after-edit:** lint Markdown after formatting ([a1cec2f](https://github.com/nerymurillohnd/codex-essentials/commit/a1cec2f722ecef6654dd28a0048fbc75ec186128))

### Bug Fixes

- address marketplace review findings ([de32626](https://github.com/nerymurillohnd/codex-essentials/commit/de32626452689b73567226444e30b7796b63bd2a))
- complete DocKeeper changelog guidance ([eb6ebf9](https://github.com/nerymurillohnd/codex-essentials/commit/eb6ebf9a12dcec04e5a40af15757fd8b0d35cb99))
- complete DocKeeper changelog guidance ([1fe8af2](https://github.com/nerymurillohnd/codex-essentials/commit/1fe8af2e798f3e90a3441c7e18a61fc1c08800d2))
- preserve release automation ownership ([941f0be](https://github.com/nerymurillohnd/codex-essentials/commit/941f0be946f2bf05fece3175a914a0d25175bd40))

## [Unreleased]

### Changed

- Declared the skill's automatic invocation policy explicitly so the package
  conforms to the marketplace agent-manifest contract.
- Refined the bundled skill frontmatter description to improve implicit
  invocation precision while preserving direct changelog and ADR maintenance
  triggers and routing boundaries.
- Recorded the complete author, legal, interface, and component metadata in
  `.codex-plugin/plugin.json`; the marketplace entry is now generated and
  reverse-validated from that manifest.
- Defined deterministic prerelease chronology and stable-promotion behavior,
  including the default cumulative stable summary when no local convention
  exists.
- Clarified semantic-release lifecycle ownership, including the distinct remote
  effects and non-responsibilities of `@semantic-release/github`.
- Required newly created changelogs to omit empty change-type sections while
  preserving the canonical relative order of sections that contain entries.

## [0.1.0] - 2026-08-28

### Added

- Added the `doc-keeper` skill with create, complete, audit, update, and repair
  modes.
- Added a changelog maintenance reference and default output example with
  evidence rules, release rollover, special cases, automation boundaries,
  validation, and recovery procedures.
- Added a MADR-based ADR maintenance reference and default output example with
  decision lifecycle, supersession, categorized-directory, validation, and
  recovery procedures.
- Added explicit safeguards against invented history, confidential disclosure,
  unauthorized local scope expansion, and unauthorized remote mutations.
- Added Codex presentation metadata and complete installation, removal,
  extension, source attribution, and failure-recovery documentation.

### Changed

- Refined skill routing for curated release history, mixed requests, ambiguous
  document types, release rollover, and audit-only completion reports.
- Strengthened changelog maintenance for completion, established local formats,
  uncertain SemVer, comparison links, independently versioned monorepos, yanked
  releases, and evidence classification.
- Strengthened ADR maintenance for completion, default identity and location,
  categorized directories, established status vocabularies, status transitions,
  changed accepted decisions, and bidirectional supersession.
- Separated operating procedures from the example files that define default
  output shape when no local convention exists.
- Added implicit companion closeout for notable implementation changes and
  explicit durable architectural decisions without a blanket lifecycle hook.
- Added changelog preflight for authorized release workflows while keeping tags,
  publication, and remote state outside DocKeeper.
- Defined explicit user declarations as primary decision evidence within the
  user's authority, without inventing unstated rationale or approvals.
- Made infrastructure-first integration explicit: use or wire native Codex,
  GitHub, release, and ADR mechanisms; add custom automation only for a proven
  gap.
- Prevented manual simulation of version files, release manifests, changelogs,
  Release PR state, tags, or publication when their configured owner is
  unavailable or prohibited.
