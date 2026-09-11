# Changelog

All notable changes to Prompt Architect are documented in this file.

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Use ISO 8601
dates (`YYYY-MM-DD`) and keep entries concise, user-facing, and actionable.

## [Unreleased]

### Added

- Add the Prompt Architect marketplace plugin and its self-contained,
  risk-calibrated prompt-authoring skill.
- Add Codex-facing skill metadata in `agents/openai.yaml` for consistent
  display and invocation.
- Add reusable references, packaged templates, examples, domain procedures,
  validation, and delivery gates for prompt authoring, audits, and execution
  planning.
- Add conditional `/goal` guidance for long-running Codex tasks that support
  persistent goals.
- Add a packaged `Stop` hook and deterministic final-output validator for Prompt
  Architect delivery checks.
- Register Prompt Architect in the marketplace catalog and root README.

### Changed

- Normalized the README navigation, heading style, backlink, and plugin version
  source statement to match the current plugin README convention.
- Refactor `SKILL.md` from a broad mandatory-read sequence into a progressive
  support-file router with explicit inputs, non-inference rules, ask/stop/decline
  behavior, and verifiable success criteria.
- Refine the bundled skill frontmatter description to improve implicit
  invocation precision for prompt authoring and audits.
- Align Codex-facing skill metadata with the package's risk-calibrated prompt
  contract.
- Package the skill's references, templates, examples, and pressure scenarios
  inside `skills/prompt-architect/` so its workflow remains reproducible from an
  installed plugin.
- Move prompt templates to `assets/templates/` and calibration plus pressure
  scenarios to `references/examples/` so support files match OpenAI's skill
  resource guidance.
- Align package documentation with the current self-contained skill layout,
  permissions, installation behavior, and verification commands.
- Distill the full prompt-authoring canon into modular runtime references for
  core sections, tool use, deviation reporting, final reporting, assembly,
  quality checks, and common prompt failures.
- Make the skill workflow boundary explicit in `SKILL.md`, including expected
  inputs, required output, non-inferable facts, stop conditions, and supporting
  file authority.
- Replace the linear workflow list with conditional routing that keeps required
  gates explicit without forcing every reference into context by default.
- Tighten the final-output validator so malformed `Ready` or
  `Needs Clarification` outputs cannot pass merely because required prompt
  sections are absent.

### Fixed

- Ignore bold headings inside a `Final Prompt` while validating the outer
  `Ready` response envelope, so generated downstream output contracts do not
  cause false Stop-hook blocks.
- Canonicalize wrapper heading case before validation so lowercase or mixed-case
  section headings cannot crash the final-output hook.
- Send malformed-output repair reasons through the Stop-hook continuation path
  instead of writing success-path JSON before returning the blocking exit code.

### Removed

- Remove the stale packaged `skills/prompt-architect/scripts/validate_skill.py`
  migration helper from the distributed skill package.
- Remove the stale migration source document from the distributed plugin after
  backing it up outside the package.
- Remove the redundant skill-level README so installed runtime guidance lives in
  `SKILL.md`, references, templates, examples, and the package README.

## [0.2.2](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/prompt-architect/v0.2.1...plugin/prompt-architect/v0.2.2) (2026-09-11)

### Changed

- Sort the final-output validator imports so strict Ruff checks pass without
  changing hook behavior.
- Normalize the final-output validator for deterministic Ruff lint and format checks.

## [0.2.1](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/prompt-architect/v0.2.0...plugin/prompt-architect/v0.2.1) (2026-09-11)

### Bug Fixes

- **quality:** enforce staged shell and Python checks ([dd6f34a](https://github.com/nerymurillohnd/codex-essentials/commit/dd6f34a5e75047a9bd3a57ae9f8e8c504e7a1195))
- **quality:** preserve staged Python modes ([37b35ee](https://github.com/nerymurillohnd/codex-essentials/commit/37b35ee4554d580e1709090c98f1169c107ab6e5))

## [0.2.0](https://github.com/nerymurillohnd/codex-essentials/compare/plugin/prompt-architect/v0.1.0...plugin/prompt-architect/v0.2.0) (2026-09-08)

### Features

- **prompt-architect:** add governed prompt authoring ([3f32f76](https://github.com/nerymurillohnd/codex-essentials/commit/3f32f7679ac0fa33c4add4eef5efd9a7bd6b5976))
- **prompt-architect:** add governed prompt authoring ([554b467](https://github.com/nerymurillohnd/codex-essentials/commit/554b467c00d0005175be507660b4b15ccdff2923))

### Bug Fixes

- **final-output:** preserve nested headings and block reasons ([a36129c](https://github.com/nerymurillohnd/codex-essentials/commit/a36129c00ab9719b5d322d9d29ea5e0d6e429461))
- **prompt-architect:** address review findings ([a087d15](https://github.com/nerymurillohnd/codex-essentials/commit/a087d1593fa16d860c70c09c32d468d47e20d036))
- **prompt-architect:** harden final-output validator ([5c72f75](https://github.com/nerymurillohnd/codex-essentials/commit/5c72f752d43257d301c3186f9ec3daefc50cffaa))
- **prompt-architect:** tighten skill routing and final validation ([219e69d](https://github.com/nerymurillohnd/codex-essentials/commit/219e69dac6355c05c0b65a4aade073cfd41e6916))
