import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");

type PackageJson = {
  overrides?: Record<string, string>;
};

type PackageLock = {
  packages: Record<string, { version?: string }>;
};

describe("dependency security", () => {
  it("overrides smol-toml to a version patched for GHSA-7w5x-hrqm-74c2", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
    ) as PackageJson;
    const packageLock = JSON.parse(
      readFileSync(resolve(repositoryRoot, "package-lock.json"), "utf8"),
    ) as PackageLock;

    expect(packageJson.overrides?.["smol-toml"]).toBe("1.8.0");
    expect(packageLock.packages["node_modules/smol-toml"]?.version).toBe(
      "1.8.0",
    );
  });
});
