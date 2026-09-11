import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

type HooksConfiguration = {
  hooks: {
    PreToolUse: Array<{
      matcher: string;
      hooks: Array<{ command: string }>;
    }>;
  };
};

const repositoryRoot = resolve(import.meta.dirname, "..");
const pluginRoot = resolve(repositoryRoot, "plugins", "block-no-verify");
const templateRoot = resolve(
  pluginRoot,
  "skills",
  "block-no-verify",
  "assets",
  "templates",
);
const temporaryRoots: string[] = [];

function readHooksConfiguration(name: string): HooksConfiguration {
  return JSON.parse(
    readFileSync(join(templateRoot, name), "utf8"),
  ) as HooksConfiguration;
}

function materializeTemplates(): string {
  const root = mkdtempSync(join(tmpdir(), "block-no-verify-"));
  temporaryRoots.push(root);
  for (const name of [
    "block-no-verify.py",
    "project-hooks.json",
    "user-hooks.json",
    "test-block-no-verify.sh",
  ]) {
    cpSync(join(templateRoot, name), join(root, name));
  }
  chmodSync(join(root, "test-block-no-verify.sh"), 0o755);
  return root;
}

function runTemplateTest(root: string) {
  return spawnSync(join(root, "test-block-no-verify.sh"), [], {
    cwd: root,
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("block-no-verify skill templates", () => {
  it("ships no active plugin hook and passes its generated maintenance contract", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"),
    ) as Record<string, unknown>;
    const projectConfig = readHooksConfiguration("project-hooks.json");
    const userConfig = readHooksConfiguration("user-hooks.json");

    expect(manifest["skills"]).toBe("./skills/");
    expect(manifest["hooks"]).toBeUndefined();
    expect(existsSync(join(pluginRoot, "hooks"))).toBe(false);
    expect(projectConfig.hooks.PreToolUse[0]?.matcher).toBe("^Bash$");
    expect(projectConfig.hooks.PreToolUse[0]?.hooks[0]?.command).toContain(
      "$(git rev-parse --show-toplevel)/.codex/hooks/block-no-verify.py",
    );
    expect(userConfig.hooks.PreToolUse[0]?.hooks[0]?.command).toContain(
      "${HOME}/.codex/hooks/block-no-verify.py",
    );

    const root = materializeTemplates();
    const result = runTemplateTest(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("PASS");
  }, 15_000);

  it("keeps installation behavior in the skill instead of an active plugin hook", () => {
    const skill = readFileSync(
      join(pluginRoot, "skills", "block-no-verify", "SKILL.md"),
      "utf8",
    );
    const readme = readFileSync(join(pluginRoot, "README.md"), "utf8");

    expect(skill).toMatch(/explicit\s+approval/u);
    expect(skill).toMatch(/project or user scope/u);
    expect(readme).toContain("does not install or enable a hook automatically");
  });

  it("registers the skill package in release and repository discovery metadata", () => {
    const rootReadme = readFileSync(join(repositoryRoot, "README.md"), "utf8");
    const releaseConfig = JSON.parse(
      readFileSync(join(repositoryRoot, "release-please-config.json"), "utf8"),
    ) as { packages: Record<string, { component: string }> };
    const releaseState = JSON.parse(
      readFileSync(
        join(repositoryRoot, ".release-please-manifest.json"),
        "utf8",
      ),
    ) as Record<string, string>;

    expect(rootReadme).toContain("plugins/block-no-verify/README.md");
    expect(releaseConfig.packages["plugins/block-no-verify"]?.component).toBe(
      "plugin/block-no-verify",
    );
    expect(releaseState["plugins/block-no-verify"]).toBe("0.2.1");
  });
});
