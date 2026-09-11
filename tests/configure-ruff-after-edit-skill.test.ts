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

function runNodeTemplateTest(directory: string, scenario: string) {
  try {
    return spawnSync("node", ["test_ruff_after_edit.mjs", scenario], {
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

  it("documents approval, attribution, rollback, and marketplace discovery", () => {
    const readme = readFileSync(join(pluginRoot, "README.md"), "utf8");
    const sources = readFileSync(
      join(skillRoot, "references", "sources-and-attribution.md"),
      "utf8",
    );

    expect(readme).toContain("Human Approval Boundaries");
    expect(readme).toContain("does not create or activate a hook");
    expect(readFileSync(join(repositoryRoot, "README.md"), "utf8")).toContain(
      "plugins/configure-ruff-after-edit/README.md",
    );
    expect(sources).toContain("Astral");
    expect(sources).toContain("PyDevTools");
    expect(sources).toContain("not affiliated");
  });

  it("documents the Node/POSIX strict-profile contract", () => {
    const readme = readFileSync(join(pluginRoot, "README.md"), "utf8");
    const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");
    const environment = readFileSync(
      join(skillRoot, "references", "environment-assessment.md"),
      "utf8",
    );
    const hookDesign = readFileSync(
      join(skillRoot, "references", "hook-design.md"),
      "utf8",
    );

    for (const document of [readme, skill, environment, hookDesign]) {
      expect(document).toContain("Node.js");
      expect(document).toContain("POSIX");
    }
    expect(readme).toContain("<project-root>/.codex/ruff.toml");
    expect(readme).toContain("~/.codex/ruff.toml");
    expect(skill).toContain("<project-root>/.codex/ruff.toml");
    expect(skill).toContain("~/.codex/ruff.toml");
    expect(environment).toContain("Windows as unsupported");
    expect(hookDesign).not.toContain("Python handler command");
  });

  it("runs safe fixes, formatting, and final lint only for reported Python files", () => {
    const result = runNodeTemplateTest(materializeTemplates(), "safe-order");

    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("check --fix --no-unsafe-fixes");
    expect(result.stdout).toContain("format");
    expect(result.stdout).toContain("check");
    expect(result.stdout).not.toContain("--unsafe-fixes");
  });

  it("ships the approved strict profile and inert Node hook commands", () => {
    expect(readFileSync(join(templatesRoot, "ruff.toml"), "utf8")).toBe(
      [
        "line-length = 100",
        "indent-width = 4",
        "force-exclude = true",
        "# Preserve Ruff's standard exclusions and omit repository-specific generated files.",
        "extend-exclude = [",
        '  ".bzr", ".direnv", ".eggs", ".git", ".git-rewrite", ".hg",',
        '  ".ipynb_checkpoints", ".mypy_cache", ".nox", ".pants.d", ".pyenv",',
        '  ".pytest_cache", ".pytype", ".ruff_cache", ".svn", ".tox", ".venv",',
        '  ".vscode", "__pycache__", "__pypackages__", "_build", "buck-out",',
        '  "build", "dist", "node_modules", "site-packages", "venv",',
        "]",
        "",
        "[lint]",
        "select = [",
        '  "E", "W", "F", "I", "UP", "B", "BLE", "SIM", "C4", "C90", "A",',
        '  "COM", "DTZ", "T10", "EXE", "FA", "FBT", "ISC", "ICN", "G", "INP",',
        '  "PIE", "PYI", "PT", "Q", "RSE", "RET", "SLF", "SLOT", "TID", "TC",',
        '  "INT", "ARG", "PTH", "TD", "FIX", "ERA", "PD", "PGH", "PL", "TRY",',
        '  "FLY", "NPY", "PERF", "FURB", "LOG", "RUF", "ANN", "D", "N", "S",',
        "]",
        "ignore = [",
        '  "W191", "E111", "E114", "E117", "D203", "D206", "D300", "Q000",',
        '  "Q001", "Q002", "Q003", "Q004", "COM812", "COM819", "ISC002", "D100",',
        '  "D104", "D213", "S101", "INP001",',
        "]",
        'fixable = ["ALL"]',
        "unfixable = []",
        "",
        "[lint.isort]",
        "force-sort-within-sections = true",
        "combine-as-imports = true",
        "order-by-type = true",
        "",
        "[lint.mccabe]",
        "max-complexity = 8",
        "",
        "[lint.pydocstyle]",
        'convention = "google"',
        "",
        "[lint.flake8-annotations]",
        "allow-star-arg-any = false",
        "mypy-init-return = true",
        "suppress-dummy-args = true",
        "suppress-none-returning = false",
        "",
        "[lint.flake8-tidy-imports]",
        'ban-relative-imports = "all"',
        "",
        "[lint.pycodestyle]",
        "max-doc-length = 100",
        "",
        "[format]",
        'quote-style = "double"',
        'indent-style = "space"',
        "skip-magic-trailing-comma = false",
        'line-ending = "auto"',
        "docstring-code-format = true",
        "docstring-code-line-length = 100",
        "",
      ].join("\n"),
    );

    for (const file of ["project-hooks.json", "user-hooks.json"]) {
      const template = JSON.parse(
        readFileSync(join(templatesRoot, file), "utf8"),
      ) as {
        hooks: { PostToolUse: Array<{ hooks: Array<{ command: string }> }> };
      };
      const command = template.hooks.PostToolUse[0]?.hooks[0]?.command ?? "";

      expect(command).toContain("ruff_after_edit.mjs");
      expect(command).toContain("command -v node");
      expect(command).not.toContain("--config");
      expect(command).not.toContain("PLUGIN_ROOT");
      expect(command).not.toContain("python");
    }

    const strictTemplates = [
      ["project-strict-profile-hooks.json", "PROJECT_ROOT"],
      ["user-strict-profile-hooks.json", "USER_HOME"],
    ] as const;
    for (const [file, scope] of strictTemplates) {
      const template = JSON.parse(
        readFileSync(join(templatesRoot, file), "utf8"),
      ) as {
        hooks: { PostToolUse: Array<{ hooks: Array<{ command: string }> }> };
      };
      const command = template.hooks.PostToolUse[0]?.hooks[0]?.command ?? "";

      expect(command).toContain("ruff_after_edit.mjs");
      expect(command).toContain("--config");
      expect(command).toContain(`REPLACE_WITH_CANONICAL_${scope}`);
      expect(command).toContain(".codex/ruff.toml");
      expect(command).not.toContain("PLUGIN_ROOT");
      expect(command).not.toContain("python");
    }
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
    "uv-only",
    "missing-ruff",
    "unfixable",
    "strict-profile",
    "packaged-config",
    "canonical-alias",
    "normal-discovery",
    "invalid-cwd",
    "posix-guard",
    "timeout",
    "node-unavailable",
  ]) {
    it(`handles ${scenario} safely`, () => {
      const result = runNodeTemplateTest(materializeTemplates(), scenario);
      expect(
        result.status,
        `${scenario}: ${result.stdout}${result.stderr}`,
      ).toBe(0);
    });
  }
});
