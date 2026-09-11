import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const pluginRoot = resolve(
  repositoryRoot,
  "plugins",
  "configure-ruff-after-edit",
);
const skillRoot = resolve(pluginRoot, "skills", "configure-ruff-after-edit");

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
});
