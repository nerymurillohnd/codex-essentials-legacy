import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const pluginRoot = resolve(
  repositoryRoot,
  "plugins",
  "configure-ruff-after-edit",
);
const skillRoot = resolve(pluginRoot, "skills", "configure-ruff-after-edit");
const templatesRoot = join(skillRoot, "assets", "templates");

function materializeTemplates(): string {
  const directory = mkdtempSync(join(tmpdir(), "configure-ruff-after-edit-"));
  cpSync(templatesRoot, directory, { recursive: true });
  return directory;
}

function runPythonTemplateTest(directory: string, scenario: string) {
  try {
    return spawnSync("python3", ["test_ruff_after_edit.py", scenario], {
      cwd: directory,
      encoding: "utf8",
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

describe("configure-ruff-after-edit skill", () => {
  it("ships an approval-gated skill without an active plugin hook", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"),
    ) as Record<string, unknown>;
    const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");

    expect(manifest["name"]).toBe("configure-ruff-after-edit");
    expect(manifest["skills"]).toBe("./skills/");
    expect(manifest["hooks"]).toBeUndefined();
    expect(existsSync(join(pluginRoot, "hooks"))).toBe(false);
    expect(skill).toMatch(/explicit approval/u);
    expect(skill).toMatch(/project or user scope/u);
  });

  it("runs safe fixes, formatting, and final lint only for reported Python files", () => {
    const result = runPythonTemplateTest(materializeTemplates(), "safe-order");

    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("check --fix --no-unsafe-fixes");
    expect(result.stdout).toContain("format");
    expect(result.stdout).toContain("check");
    expect(result.stdout).not.toContain("--unsafe-fixes");
  });

  for (const scenario of [
    "multiple-files",
    "apply-patch",
    "non-python",
    "outside",
    "relative-escape",
    "symlink",
    "parent-symlink",
    "missing-file",
    "python-directory",
    "uv-lock",
    "missing-ruff",
    "unfixable",
  ]) {
    it(`handles ${scenario} safely`, () => {
      const result = runPythonTemplateTest(materializeTemplates(), scenario);
      expect(
        result.status,
        `${scenario}: ${result.stdout}${result.stderr}`,
      ).toBe(0);
    });
  }
});
