import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const auth = require(
  resolve(import.meta.dirname, "../scripts/release-pr-auth.cjs"),
) as {
  isTrustedReleasePleasePullRequest(
    title: string,
    authorType: string,
    labels: string[],
  ): boolean;
};

describe("release PR authentication", () => {
  it("accepts only bot release PRs with a Release Please label", () => {
    expect(
      auth.isTrustedReleasePleasePullRequest(
        "chore(main): release plugin/doc-keeper 0.2.0",
        "Bot",
        ["autorelease: pending"],
      ),
    ).toBe(true);
    expect(
      auth.isTrustedReleasePleasePullRequest(
        "chore(main): release plugin/doc-keeper 0.2.0",
        "User",
        ["autorelease: pending"],
      ),
    ).toBe(false);
    expect(
      auth.isTrustedReleasePleasePullRequest(
        "chore(main): release plugin/doc-keeper 0.2.0",
        "Bot",
        [],
      ),
    ).toBe(false);
    expect(
      auth.isTrustedReleasePleasePullRequest(
        "feat: release plugin/doc-keeper 0.2.0",
        "Bot",
        ["autorelease: pending"],
      ),
    ).toBe(false);
  });
});
