import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");

type Tool = {
  name: string;
  version: string;
  onFail: "error";
};

type PackageJson = {
  engines: Record<string, string>;
  devEngines: {
    runtime: Tool;
    packageManager: Tool;
  };
};

describe("environment contract", () => {
  it("pins NVM, Node.js, and npm to the supported development runtime", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
    ) as PackageJson;

    expect(readFileSync(resolve(repositoryRoot, ".nvmrc"), "utf8").trim()).toBe(
      "24.21.0",
    );
    expect(packageJson.engines).toEqual({ node: "24.21.0", npm: "12.0.2" });
    expect(packageJson.devEngines).toEqual({
      runtime: { name: "node", version: "24.21.0", onFail: "error" },
      packageManager: { name: "npm", version: "12.0.2", onFail: "error" },
    });
  });
});
