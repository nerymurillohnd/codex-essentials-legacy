import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const contract = require("../scripts/validate-release-contract.cjs") as {
  main(args: string[]): void;
  parseTag(tag: string): { pluginId: string; version: string };
  run(args: string[]): number;
  validateChangeRouting(
    root: string,
    base: string,
    head: string,
    direct: boolean,
  ): void;
  validateRepository(root: string): void;
  validateUnreleased(path: string): void;
};
const fixtures: string[] = [];
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "codex-release-contract-"));
  fixtures.push(directory);
  for (const name of [
    "plugins",
    "schemas",
    "templates",
    "scripts",
    ".github",
    "docs",
  ])
    cpSync(join(root, name), join(directory, name), { recursive: true });
  for (const name of [
    "package.json",
    "release-please-config.json",
    ".release-please-manifest.json",
  ])
    cpSync(join(root, name), join(directory, name));
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "chore: baseline"],
  ]) {
    expect(
      spawnSync("git", ["-C", directory, ...args], { encoding: "utf8" }).status,
    ).toBe(0);
  }
  return directory;
}

function commit(directory: string, subject: string) {
  expect(
    spawnSync("git", ["-C", directory, "add", "."], { encoding: "utf8" })
      .status,
  ).toBe(0);
  expect(
    spawnSync("git", ["-C", directory, "commit", "-m", subject], {
      encoding: "utf8",
    }).status,
  ).toBe(0);
}
afterEach(() =>
  fixtures
    .splice(0)
    .forEach((entry) => rmSync(entry, { recursive: true, force: true })),
);

describe("release contract", () => {
  it("accepts every current plugin and parses exact plugin tags", () => {
    contract.validateRepository(root);
    expect(contract.parseTag("plugin/astro-cli-commands/v0.1.1")).toEqual({
      pluginId: "astro-cli-commands",
      version: "0.1.1",
    });
  });
  it("rejects malformed tags and manifest version drift", () => {
    expect(() => contract.parseTag("v1.2.3")).toThrow("invalid release tag");
    expect(() => contract.parseTag("plugin/doc-keeper/vbroken")).toThrow(
      "invalid release tag",
    );
    const changelog = join(fixture(), "missing.md");
    writeFileSync(changelog, "# Missing\n");
    expect(() => contract.validateUnreleased(changelog)).toThrow(
      "## [Unreleased]",
    );
    const directory = fixture();
    const manifest = join(
      directory,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    );
    const json = JSON.parse(readFileSync(manifest, "utf8"));
    json.version = "invalid";
    writeFileSync(manifest, `${JSON.stringify(json)}\n`);
    expect(() => contract.validateRepository(directory)).toThrow(
      "/version must match pattern",
    );
  });
  it("rejects incomplete components and artifact-producing workflow commands", () => {
    const directory = fixture();
    const config = join(directory, "release-please-config.json");
    const json = JSON.parse(readFileSync(config, "utf8"));
    delete json.packages["plugins/doc-keeper"];
    writeFileSync(config, `${JSON.stringify(json)}\n`);
    expect(() => contract.validateRepository(directory)).toThrow(
      "exactly match",
    );
    cpSync(join(root, "release-please-config.json"), config);
    const workflow = join(directory, ".github/workflows/release-please.yml");
    writeFileSync(
      workflow,
      `${readFileSync(workflow, "utf8")}\nrun: gh release upload x y\n`,
    );
    expect(() => contract.validateRepository(directory)).toThrow(
      "must not publish",
    );
  });
  it("rejects every per-plugin release metadata mismatch", () => {
    const cases = [
      (directory: string) => {
        const file = join(directory, "release-please-config.json");
        const json = JSON.parse(readFileSync(file, "utf8"));
        json.packages["plugins/doc-keeper"].component = "wrong";
        writeFileSync(file, JSON.stringify(json));
        return "component name is invalid";
      },
      (directory: string) => {
        const file = join(directory, "release-please-config.json");
        const json = JSON.parse(readFileSync(file, "utf8"));
        json.packages["plugins/doc-keeper"]["extra-files"] = [];
        writeFileSync(file, JSON.stringify(json));
        return "must update manifest version";
      },
      (directory: string) => {
        const file = join(directory, ".release-please-manifest.json");
        const json = JSON.parse(readFileSync(file, "utf8"));
        json["plugins/doc-keeper"] = "invalid";
        writeFileSync(file, JSON.stringify(json));
        return "release state must be SemVer";
      },
      (directory: string) => {
        const file = join(directory, ".release-please-manifest.json");
        const json = JSON.parse(readFileSync(file, "utf8"));
        json["plugins/doc-keeper"] = "0.1.1";
        writeFileSync(file, JSON.stringify(json));
        return "release state must match manifest version";
      },
      (directory: string) => {
        const file = join(directory, "plugins/doc-keeper/CHANGELOG.md");
        writeFileSync(file, "# Changelog\n");
        return "must contain an Unreleased section";
      },
    ];
    for (const mutate of cases) {
      const directory = fixture();
      expect(() => contract.validateRepository(directory)).toThrow(
        mutate(directory),
      );
    }
  }, 15_000);
  it("runs CLI success and failure paths with tag validation", () => {
    const directory = fixture();
    expect(contract.run(["--root", directory])).toBe(0);
    const trustedDirectory = fixture();
    writeFileSync(
      join(trustedDirectory, "plugins/doc-keeper/CHANGELOG.md"),
      "# Changelog\n",
    );
    expect(
      contract.run([
        "--root",
        trustedDirectory,
        "--base",
        "HEAD",
        "--head",
        "HEAD",
        "--title",
        "chore(main): release plugin/doc-keeper 0.2.0",
        "--author-type",
        "Bot",
        "--labels",
        "autorelease: pending",
      ]),
    ).toBe(0);
    const currentVersion = (
      JSON.parse(
        readFileSync(
          join(directory, "plugins/doc-keeper/.codex-plugin/plugin.json"),
          "utf8",
        ),
      ) as { version: string }
    ).version;
    const invalidVersion = currentVersion === "0.0.0" ? "0.0.1" : "0.0.0";
    expect(
      contract.run([
        "--root",
        directory,
        "--tag",
        `plugin/doc-keeper/v${currentVersion}`,
      ]),
    ).toBe(0);
    expect(
      contract.run([
        "--root",
        directory,
        "--tag",
        `plugin/doc-keeper/v${invalidVersion}`,
      ]),
    ).toBe(1);
    expect(contract.run(["--root", directory, "--tag"])).toBe(1);
    expect(() =>
      contract.main(["--root", directory, "--tag", "plugin/missing/v0.1.0"]),
    ).toThrow();
    const executable = spawnSync(
      process.execPath,
      [
        join(root, "scripts/validate-release-contract.cjs"),
        "--root",
        directory,
      ],
      { encoding: "utf8" },
    );
    expect(executable.status).toBe(0);
  }, 15_000);
  it("enforces direct and plugin change routing from an actual Git diff", () => {
    const directory = fixture();
    const base = spawnSync("git", ["-C", directory, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).stdout.trim();
    const audit = join(directory, "docs/audits/routing.md");
    writeFileSync(audit, "# Audit\n");
    commit(directory, "docs: add audit");
    contract.validateChangeRouting(directory, base, "HEAD", true);
    writeFileSync(join(directory, "AGENTS.md"), "changed\n");
    commit(directory, "docs: change policy");
    expect(() =>
      contract.validateChangeRouting(directory, base, "HEAD", true),
    ).toThrow("direct pushes");
    const pluginBase = spawnSync(
      "git",
      ["-C", directory, "rev-parse", "HEAD"],
      { encoding: "utf8" },
    ).stdout.trim();
    writeFileSync(
      join(directory, "plugins/doc-keeper/README.md"),
      "# changed\n",
    );
    commit(directory, "docs: plugin copy");
    contract.validateChangeRouting(directory, pluginBase, "HEAD", false);
    const releaseBase = spawnSync(
      "git",
      ["-C", directory, "rev-parse", "HEAD"],
      { encoding: "utf8" },
    ).stdout.trim();
    const skill = join(
      directory,
      "plugins/doc-keeper/skills/doc-keeper/SKILL.md",
    );
    writeFileSync(skill, `${readFileSync(skill, "utf8")}\n`);
    commit(directory, "docs(doc-keeper): clarify skill copy");
    expect(() =>
      contract.validateChangeRouting(directory, releaseBase, "HEAD", false),
    ).toThrow("releasable Conventional Commit");
    writeFileSync(skill, `${readFileSync(skill, "utf8")}\n`);
    commit(directory, "fix(doc-keeper): correct copy");
    contract.validateChangeRouting(directory, releaseBase, "HEAD", false);
    const cleanDirectory = fixture();
    expect(
      contract.run([
        "--root",
        cleanDirectory,
        "--base",
        "HEAD",
        "--head",
        "HEAD",
      ]),
    ).toBe(0);
    expect(contract.run(["--root", cleanDirectory, "--base"])).toBe(1);
  });
});
