# Pending Debt

Use this file for unresolved maintenance work, known limitations, and follow-up tasks.

- 2026-09-07 — Defer the coordinated `vitest` and `@vitest/coverage-v8` 5.0.0
  migration. Owner: Marketplace maintenance. Impact: the strict TypeScript
  validation gate cannot pass with the only published Vitest 5.0.0 release.
  At revision `3c43189`, a clean consumer install was tested with
  `vitest@5.0.0`, `@vitest/coverage-v8@5.0.0`, the explicit resolution patch
  `@vitest/expect@5.0.0`, and the upstream `MarkOptions` declaration shape.
  `npm run typecheck` and `npx tsc6 --noEmit` still fail in the published Vite
  and Vitest declarations with `TS2430`: `test.benchmark.provider` is
  `string | undefined` where `string` is required. Node 24.20.0 and Vite
  6.4.3, 7.3.6, and 8.2.2 all satisfy Vitest 5's documented minimums, so this
  is not a project runtime prerequisite failure. The upstream
  [`#11141` fix](https://github.com/vitest-dev/vitest/pull/11141), merged
  2026-09-04, corrects the `@vitest/expect` and `MarkOptions` declaration
  defects but is not in the npm `5.0.0` release. Keep both packages aligned at
  4.1.11 and do not relax `skipLibCheck`. Next action and review condition:
  reassess after an npm release containing the upstream type fixes passes
  `HUSKY=0 npm ci`, `npm run typecheck`, `npx tsc6 --noEmit`, and
  `npm run check` in a clean consumer install.
- 2026-08-31 — Reconcile current GitHub branch protection and security controls
  with the documented policy. Verified live: `main` rejects force pushes and
  deletion and enforces administrators; the plugin release-tag ruleset is
  active; Dependabot security updates, secret scanning, secret scanning push
  protection, and automated security fixes are enabled. Current gaps or
  decisions: `main` has no required pull-request reviews or status checks,
  `secret_scanning_non_provider_patterns` and validity checks are disabled, and
  the historical resolved-debt entry records a stronger branch-protection
  state. Decide and record whether the current direct-documentation routing is
  intentional before closing this item.
- 2026-08-31 — Decide whether to activate the organization-level GitHub Project
  bootstrap. `GITHUB_ORG` and `PROJECT_TITLE` are not configured in the current
  local environment, and the authenticated `gh` token lacks `read:project`, so
  the existence of the target Project cannot be verified. Keep this optional
  until an organization, title, and Projects-scoped authorization are
  explicitly selected; do not treat the helper or its template as evidence
  that a Project exists.
