import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const hook = readFileSync(
  resolve(repositoryRoot, ".husky", "pre-commit"),
  "utf8",
);

describe("pre-commit quality policy", () => {
  it("runs staged shell and Python validation without bypassing Prettier", () => {
    expect(hook.startsWith("#!/usr/bin/env bash\n")).toBe(true);
    expect(hook).toContain("git-format-staged");
    expect(hook).toContain(
      "git diff --cached --name-only -z --diff-filter=ACMR",
    );
    expect(hook).toContain('shellcheck -- "${file}"');
    expect(hook).toContain('shfmt -d -- "${file}"');
    expect(hook).toContain('uvx ruff@0.16.6 check -- "${file}"');
    expect(hook).toContain('uvx ruff@0.16.6 format --check -- "${file}"');
  });
});
