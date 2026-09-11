# Pending Debt

Use this file for unresolved maintenance work, known limitations, and follow-up tasks.

- 2026-09-07 [P2] — Defer the coordinated `vitest` and `@vitest/coverage-v8` 5.0.0
  migration. Owner: Marketplace maintenance. Impact: the strict TypeScript
  validation gate cannot pass with the only published Vitest 5.0.0 release.
  At revision `3c43189`, a clean consumer install was tested with
  `vitest@5.0.0`, `@vitest/coverage-v8@5.0.0`, the explicit resolution patch
  `@vitest/expect@5.0.0`, and the upstream `MarkOptions` declaration shape.
  `npm run typecheck` and `npx tsc6 --noEmit` still fail in the published Vite
  and Vitest declarations with `TS2430`: `test.benchmark.provider` is
  `string | undefined` where `string` is required. Node 24.21.0 and Vite
  6.4.3, 7.3.6, and 8.2.2 all satisfy Vitest 5's documented minimums, so this
  is not a project runtime prerequisite failure. The upstream
  [`#11141` fix](https://github.com/vitest-dev/vitest/pull/11141), merged
  2026-09-04, corrects the `@vitest/expect` and `MarkOptions` declaration
  defects but is not in the npm `5.0.0` release. Keep both packages aligned at
  4.1.11 and do not relax `skipLibCheck`. Next action and review condition:
  reassess after an npm release containing the upstream type fixes passes
  `HUSKY=0 npm ci`, `npm run typecheck`, `npx tsc6 --noEmit`, and
  `npm run check` in a clean consumer install.
  Reviewed 2026-09-10 at revision `2d19f31`: npm still reports `vitest`,
  `@vitest/coverage-v8`, and `@vitest/expect` latest as `5.0.0`; the repository
  remains on the verified 4.1.11 pair.
