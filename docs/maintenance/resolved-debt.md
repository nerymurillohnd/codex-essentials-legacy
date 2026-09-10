# Resolved Debt

Move completed maintenance items here with the resolution date and verification reference.

Entries below are dated historical resolutions. When a later remote or
repository change supersedes one of them, keep the historical record and track
the current follow-up in [pending-debt.md](pending-debt.md).

- 2026-09-10 — Resolved pending debt `2026-09-10 [P2]` for contradictory
  contributor release instructions. Replaced the claim that no release
  workflow, tag convention, or release credential exists with the implemented
  no-artifact Release Please procedure: releasable Conventional Commit and
  `Unreleased` entry, reviewed plugin PR, generated release PR, then immutable
  `plugin/<id>/v<semver>` tag and GitHub Release notes. The guide now states
  that contributors do not manually bump versions, create tags or releases, or
  configure a separate credential. Verification: Markdown lint and the
  repository documentation and release-contract gates.

- 2026-09-10 — Resolved pending debt `2026-09-10 [P1]` for the quoted-secret
  bypass in `scripts/documentation-gate.cjs`. Narrowed the credential-pattern
  exception to accept only an exact `${VAR}` reference, optionally wrapped in
  quotes, instead of exempting all quoted values. Added an integration test
  proving that a quoted literal assignment is rejected by the documentation
  gate. Verified at the remediation revision with the focused marketplace
  pipeline test (32 tests), then `npm run check` and `npm audit --json`.

- 2026-09-10 — Resolved pending debt `2026-09-10 [P1]` for
  `GHSA-7w5x-hrqm-74c2` / `CVE-2026-85730` in transitive `smol-toml`. Added an
  npm override to resolve `markdownlint-cli2` 0.23.2's exact 1.7.0 dependency
  as `smol-toml` 1.8.0, which is later than the advisory's first patched
  version, 1.7.1. Added regression coverage for the override and lockfile
  resolution. Verified at the remediation revision with `HUSKY=0 npm ci`, the
  focused dependency-security test, `npm run check` (110 tests across 16
  files), `npm audit --json` (zero vulnerabilities), and `npm ls` showing
  `smol-toml@1.8.0 overridden`. The install-scripts policy continued to block
  undeclared `simple-git-hooks` postinstall execution.

- 2026-09-07 — Updated the Node.js declaration dependency from
  `@types/node` 26.4.1 to 26.5.0, including the lockfile resolution of
  `undici-types` 8.9.0. Verified at revision `3c43189` with
  `HUSKY=0 npm ci`, `npm run check` (105 tests across 13 files),
  `npm outdated --json` (only the separately deferred Vitest 5 pair remains),
  and `npm audit --json` (zero vulnerabilities). The install-scripts policy
  continued to block undeclared `simple-git-hooks` postinstall execution.

- 2026-09-07 — Reconciled the current direct-documentation routing policy with
  repository guidance. The current policy in the root `AGENTS.md` and
  [ADR-0015](../decisions/adr-0015-plugin-versioning-without-artifacts.md)
  requires pull requests for product, package, catalog, script, test, schema,
  security, permission, refactor, compatibility, release-control, and policy
  changes, while limiting direct pushes to non-policy plans, audits, and
  maintenance records under `docs/`. Verified live at revision `e558763`: the
  `main` branch still rejects force pushes and deletion, enforces
  administrators, and requires conversation resolution, with no global required
  pull-request review or status-check rules. The remaining optional security
  control decision stays tracked in [pending-debt.md](pending-debt.md).

- 2026-08-31 — Reorganized repository tooling into its established boundaries:
  moved the agent schema to `schemas/`, moved reusable validators, generators,
  quality helpers, and Project bootstrap code to `scripts/`, moved their tests
  to `tests/`, and removed the unused `lib/` tree. Updated package scripts,
  TypeScript/Vitest discovery, current documentation, and historical audit
  links. Verified with `npm run check`, which passed 24 tests and validated four
  plugin manifests and the marketplace catalog.

- 2026-08-31 — Retired GitHub Pages from the marketplace repository. Deleted the
  remote `github-pages` environment after Pages was disabled and verified that
  no active Pages environment remains and the public Pages URL returns `404`.
  GitHub's managed `pages-build-deployment` history entry remains visible but
  is not repository configuration and cannot be deleted or disabled through the
  available API. See [ADR-0012](../decisions/adr-0012-retire-github-pages.md).

- 2026-08-27 — Closed the skill-agent metadata drift gap by requiring a
  schema-valid `skills/<skill-id>/agents/openai.yaml` for every distributed
  `SKILL.md`, migrating both published plugins, and aligning agent metadata
  with each single-skill package manifest. Verified through schema, generator,
  validator, documentation-gate, release-validator, and complete coverage tests.

- 2026-08-27 — Updated `prettier-after-edit` hook bootstrap to resolve the
  plugin package root with Codex-first precedence (`CODEX_PLUGIN_ROOT` →
  `CLAUDE_PLUGIN_ROOT` → `PLUGIN_ROOT`) and added explicit compatibility fallback
  for local/dev usage. Verified through `hooks.json` execution path review and
  `plugins/prettier-after-edit/hooks/hooks.json` alignment.
- 2026-08-27 — Fixed `prettier-after-edit` hook payload parsing so
  `apply_patch` freeform events are handled correctly by extracting target files
  directly from `*** Add File:` / `*** Update File:` directives when
  `tool_input.command` is absent. Verified with
  `npx vitest run tests/prettier-after-edit-hooks.test.ts` and `shellcheck` on
  the updated hook script.

- 2026-08-27 — Added `// @ts-check` to every repository JavaScript source,
  introduced the separate `tsconfig.scripts.json` `checkJs` project, and added
  `scripts/tsconfig.json` for editor project association without changing the
  TypeScript-only root project. Verified with `npm run check` and both
  TypeScript 7 and TypeScript 6 script-project checks.
- 2026-08-27 — Migrated Vitest tests to TypeScript, corrected the strict
  `tsconfig.json` boundaries, and made `tsconfig.build.json` compatible with
  TypeScript 7. All repository `.ts` files are typechecked while runtime
  CommonJS/ESM tooling remains excluded. Verified with `npm run check` and
  `npx tsc --project tsconfig.build.json`.
- 2026-08-27 — Added the documented TypeScript side-by-side aliases: native
  TypeScript 7 through `@typescript/native` and the TypeScript 6 compiler API
  through `typescript`. Verified with `npx tsc --version`, `npx tsc6 --version`,
  and both no-emit checks.
- 2026-08-27 — Confirmed that the `@typescript/typescript6` wrapper publishes
  through `6.0.2` while its `@typescript/old` dependency provides the effective
  TypeScript 6.0.3 API. Verified against npm metadata and
  `require("typescript").version`.
- 2026-08-27 — Added canonical plugin README and changelog templates, generator
  scaffolding, documentation validation, GitHub contribution forms, release
  configuration, documentation gates, per-plugin release validation, and a
  dry-run/idempotent Projects bootstrap helper. Verified with the repository
  format, lint, typecheck, Vitest coverage, and manifest validation gates.
- 2026-08-27 — Updated GitHub Actions jobs that execute repository Node tooling
  to the current Node.js-24-compatible releases: `actions/checkout` `v7.0.1`
  and `actions/setup-node` `v7.0.0`, both pinned to immutable commit SHAs. Kept
  explicit `node-version: "24"` selection for Node-tooling jobs and documented
  the 2026-09-23 Node.js 20 removal deadline and runner compatibility
  constraints. Verified with workflow contract tests and the complete
  repository quality gate.
- 2026-08-27 — Normalized repository ignore policy for generated Husky internals,
  diagnostics output, Python caches, build output, and operating-system files.
  Removed repository-tracked `.DS_Store` files and documented that authored
  hooks are linted separately from generated `.husky/_/*` infrastructure. Local
  macOS metadata may reappear, but remains ignored and untracked.
- 2026-08-30 — Retired the duplicate public Codex Essentials Wiki and removed
  its `Home` page. The repository README is the public homepage and `docs/` is
  the canonical versioned documentation surface. See
  [ADR-0011](../decisions/adr-0011-retire-github-wiki.md).
- 2026-08-27 — Added `.github/dependabot.yml` for weekly npm and GitHub Actions
  dependency updates, with a limit of 10 open pull requests per ecosystem.
  Verified the configuration with Prettier and observed Dependabot update runs
  on the default branch.
- 2026-08-27 — Removed two generated Playwright MCP accessibility snapshots
  that had entered the public repository accidentally. Verified that the
  snapshots are absent from `main` and the working tree is clean.
- 2026-08-27 — Protected the GitHub `main` branch against force pushes and
  deletion, required conversation resolution, and required the `Required quality
gates` quality aggregator plus the `documentation`, `CodeQL`, `Workflow lint`,
  and `Dependency review` checks before merge. Verified through the GitHub
  branch protection API at that time. The current branch-protection state is
  tracked separately in [pending-debt.md](pending-debt.md).
- 2026-08-27 — Added the protected GitHub `release` environment with
  `nerymurillohnd` as a required reviewer and created the active `Protect plugin
release tags` repository ruleset for `refs/tags/plugin/**/v*`. The ruleset
  blocks tag deletion and non-fast-forward tag updates while still allowing new
  plugin release tags to be created. Verified through the GitHub Environments
  and Rulesets APIs. The `release` environment was later retired; the tag
  ruleset remains active.
