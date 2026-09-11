import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const hook = readFileSync(
  resolve(repositoryRoot, ".husky", "pre-commit"),
  "utf8",
);
const qualityHookPath = resolve(repositoryRoot, ".husky", "pre-commit-quality");
const packageJson = JSON.parse(
  readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
) as { scripts: Record<string, string> };

describe("pre-commit quality policy", () => {
  it("uses a POSIX Husky entrypoint to launch staged shell and Python validation", () => {
    expect(hook.startsWith("#!/usr/bin/env sh\n")).toBe(true);
    expect(hook).toContain('exec bash "$(dirname "$0")/pre-commit-quality"');
    expect(existsSync(qualityHookPath)).toBe(true);
    if (!existsSync(qualityHookPath)) {
      return;
    }
    const qualityHook = readFileSync(qualityHookPath, "utf8");
    expect(qualityHook.startsWith("#!/usr/bin/env bash\n")).toBe(true);
    expect(qualityHook).toContain("git-format-staged");
    expect(qualityHook).toContain("git rev-parse --git-dir");
    expect(qualityHook).toContain(
      "git diff --cached --name-only -z --diff-filter=ACMR",
    );
    expect(qualityHook).toContain('git show ":${file}" >"${temporary_file}"');
    expect(qualityHook).toContain('shellcheck -- "${temporary_file}"');
    expect(qualityHook).toContain('shfmt -d -- "${temporary_file}"');
    expect(qualityHook).toContain(
      'uvx ruff@0.16.6 check --isolated -- "${temporary_file}"',
    );
    expect(qualityHook).toContain(
      'uvx ruff@0.16.6 format --isolated --check -- "${temporary_file}"',
    );
    expect(qualityHook).toContain('git ls-files --stage -- "${file}"');
    expect(qualityHook).toContain('chmod +x "${temporary_file}"');
    expect(qualityHook).toContain("brew install shellcheck shfmt");
    expect(qualityHook).toContain("uv tool install ruff@0.16.6");
  });

  it("runs the staged language checks in the authoritative quality gate", () => {
    const shellLint = packageJson.scripts["lint:shell"];
    const shellFormat = packageJson.scripts["format:shell:check"];
    const pythonLint = packageJson.scripts["lint:python"];
    const pythonFormat = packageJson.scripts["format:python:check"];
    expect(shellLint).toBeTypeOf("string");
    expect(shellFormat).toBeTypeOf("string");
    expect(pythonLint).toBeTypeOf("string");
    expect(pythonFormat).toBeTypeOf("string");
    if (
      typeof shellLint !== "string" ||
      typeof shellFormat !== "string" ||
      typeof pythonLint !== "string" ||
      typeof pythonFormat !== "string"
    ) {
      return;
    }
    expect(shellLint).toContain("shellcheck");
    expect(shellFormat).toContain("shfmt -d");
    expect(pythonLint).toContain("uvx ruff@0.16.6 check --isolated");
    expect(pythonFormat).toContain("uvx ruff@0.16.6 format --isolated --check");
    expect(packageJson.scripts["check"]).toContain("npm run lint:shell");
    expect(packageJson.scripts["check"]).toContain("npm run lint:python");
  });
});
