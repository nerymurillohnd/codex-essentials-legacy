# Plugin Versioning Without Distribution Artifacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Version every marketplace plugin independently with reviewable release pull requests, immutable tags, and zero uploaded release assets.

**Architecture:** Release Please manifest mode owns Conventional Commit analysis, release pull requests, SemVer calculation, and GitHub Release records. `scripts/validate-release-contract.cjs` owns local structural validation; the workflow invokes it before and after Release Please, while tests validate its CLI and the workflow's no-artifact contract.

**Tech Stack:** Node.js 24, CommonJS CLI scripts, Vitest, YAML, GitHub Actions, Release Please Action.

**Spec:** `docs/superpowers/specs/2026-09-07-plugin-versioning-no-artifacts-design.md`

## Global Constraints

- `plugins/<plugin-id>/.codex-plugin/plugin.json` is the only authored plugin version source.
- Use exact tags `plugin/<plugin-id>/v<semver>`.
- Do not publish packages, call npm publish, create archives/checksums, or upload release assets.
- Use only `GITHUB_TOKEN`; do not introduce release credentials.
- Preserve the existing dirty `release-notes.md` change; stage and commit no files unless separately authorized.

---

### Task 1: Release-contract validator and failing tests

**Files:**

- Create: `scripts/validate-release-contract.cjs`
- Create: `tests/release-contract.test.ts`
- Modify: `package.json`
- Modify: `tests/coverage-contract.test.ts`

**Interfaces:**

- Produces `run(args: string[]): number`, `validateRepository(root: string): void`, and `parseTag(tag: string): { pluginId: string; version: string }`.
- The CLI accepts `--root <repository-root>` and optional `--tag <plugin/id/vX.Y.Z>`.

- [ ] Write tests that create a copied repository fixture and expect failure for `version: "not-semver"`, missing `## [Unreleased]`, a tag version different from its manifest, a missing Release Please component, and a workflow containing `gh release upload`.
- [ ] Run `npx vitest run tests/release-contract.test.ts`; observe failure because the validator does not exist.
- [ ] Implement strict SemVer, exact manifest/component path coverage, non-empty Unreleased validation, tag parsing/version matching, and forbidden command detection.
- [ ] Add `validate:release-contract` to `package.json` and invoke it from `npm run check`.
- [ ] Add tests for the routing matrix: reject a direct-push candidate that touches a plugin or control path; accept a documentation-record-only candidate; require a release intent and `Unreleased` for plugin behavior changes; and allow editorial plugin documentation through a PR without a bump.
- [ ] Add the script to the coverage inventory and rerun the focused test until it passes.

### Task 2: Manifest-mode configuration and asset-free workflow

**Files:**

- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`
- Create: `.github/workflows/release-please.yml`
- Modify: `tests/release-contract.test.ts`

**Interfaces:**

- Each `plugins/<id>` configuration entry names its component, uses a changelog-only release strategy and JSON `$.version` updater, and produces `plugin/<id>/vX.Y.Z`.
- The workflow runs `release-please-action` on pushes to `main`, has only `contents: write` and `pull-requests: write`, runs the local validator, and verifies `assets.length === 0` for every created release.

- [ ] Extend tests to require one configuration component for every manifest, exact component/tag naming, a release manifest entry for every component, and an action workflow that has no `npm publish`, archive, checksum, artifact upload, or `gh release upload` command.
- [ ] Run the focused test; observe failure because configuration and workflow are absent.
- [ ] Add manifest configuration seeded at current plugin versions and use the existing historical release baselines without retagging them.
- [ ] Add the workflow with pinned actions, no package installation/publication step, and a post-release GitHub API assertion that uploaded assets are empty.
- [ ] Rerun the focused test; observe success.

### Task 3: Repository policy and contributor documentation

**Files:**

- Modify: `AGENTS.md`
- Modify: `plugins/AGENTS.md`
- Modify: `.agents/skills/declarative-plugin-pipeline/SKILL.md`
- Modify: `.agents/skills/declarative-plugin-pipeline/references/pipeline-protocol.md`
- Create: `docs/decisions/adr-0015-plugin-versioning-without-artifacts.md`

- [ ] Update source-of-truth and release-policy text to permit Git tags and GitHub Release records while prohibiting uploaded artifacts and package publication.
- [ ] Record the architectural decision, bootstrap limits, tag convention, GitHub automatic source-archive exception, and recovery path in ADR-0015.
- [ ] Update pipeline guidance to require the release-contract check and to remove archive/checksum validation references.
- [ ] Publish the path-and-impact routing matrix: PR plus bump, PR without bump, and the narrow documentation-only direct-push exception. Document that commit scopes cannot bypass path-based routing.
- [ ] Run Markdownlint and local link checks for each changed Markdown file.

### Task 4: Full local verification and remote-ready proof

**Files:**

- Verify: all files above

- [ ] Run `npm run validate:release-contract` against the repository and once with a deliberately mismatched temporary tag value; expect success then the exact mismatch failure.
- [ ] Run `npm run marketplace:build`, restore no generated drift, and run `npm run documentation:gate -- --base HEAD --head HEAD` only if its revision contract can see the changed paths.
- [ ] Run `npm run check`, `git diff --check`, and focused release-contract tests.
- [ ] Inspect the workflow text for zero archive, checksum, upload, registry, or release-asset commands.
- [ ] Do not tag, publish, push, or create a pull request without separate authorization; report that a future merged release PR is the required remote proof.
