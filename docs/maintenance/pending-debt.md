# Pending Debt

Use this file for unresolved maintenance work, known limitations, and follow-up tasks.

- 2026-09-10 [P0] — Release Please generated the open
  [release pull request #77](https://github.com/nerymurillohnd/codex-essentials/pull/77)
  for `block-no-verify` 0.2.0, but its Quality workflow fails at
  `npm run format:check`: the generated
  `plugins/block-no-verify/CHANGELOG.md` is not Prettier-formatted. Owner:
  Release automation. Impact: the plugin version cannot be released while the
  generated pull request remains unmergeable. Evidence: workflow run
  [`34432348346`](https://github.com/nerymurillohnd/codex-essentials/actions/runs/34432348346)
  failed on 2026-09-10 before tests ran; the source push at `77b24b8` passed
  the same quality gate. Next action and review condition: make the release
  changelog generation or post-generation formatting deterministic, then
  regenerate a release pull request that passes `npm run check` and the
  required remote Quality workflow.
- 2026-09-10 [P1] — GitHub protection for `main` does not require approving
  reviews or status checks. Owner: Repository governance. Impact: the
  repository policy requires pull requests for product and control changes,
  but GitHub does not technically prevent a direct integration that bypasses
  pre-merge quality and separation of duties. Evidence: the GitHub branch
  protection API verified on 2026-09-10 enforces administrators, conversation
  resolution, no force pushes, and no deletions, but returns no required
  review or status-check policy. Next action and review condition: select and
  apply a protection policy for approvals and required checks, then verify it
  through the GitHub API and an authorized pull-request workflow.
- 2026-09-07 [P2] — Defer the coordinated `vitest` and `@vitest/coverage-v8` 5.0.0
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
  Reviewed 2026-09-07 at revision `e558763`: npm still reports `vitest`,
  `@vitest/coverage-v8`, and `@vitest/expect` latest as `5.0.0`; the repository
  remains on the verified 4.1.11 pair.
- 2026-08-31 [P2] — Decide whether to enable remaining optional or stronger GitHub
  security controls. Verified live 2026-09-07 at revision `e558763`: `main`
  rejects force pushes and deletion, enforces administrators, and requires
  conversation resolution; Dependabot security updates, secret scanning, and
  secret scanning push protection are enabled; `secret_scanning_non_provider_patterns`
  and secret scanning validity checks are disabled. Current gap or decision:
  choose whether those disabled security features should be enabled or accepted
  as-is. The direct-documentation routing decision is now resolved in
  [resolved-debt.md](resolved-debt.md).
- 2026-08-31 — Decide whether to activate the organization-level GitHub Project
  bootstrap. `GITHUB_ORG` and `PROJECT_TITLE` are not configured in the current
  local environment, and the authenticated `gh` token lacks `read:project`, so
  the existence of the target Project cannot be verified. Keep this optional
  until an organization, title, and Projects-scoped authorization are
  explicitly selected; do not treat the helper or its template as evidence that
  a Project exists. Reviewed 2026-09-07 at revision `e558763`: neither
  environment variable is configured in the local shell used for verification.
