import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const marketplaceContract = require("../scripts/marketplace-contract.cjs");
const documentationGate = require("../scripts/documentation-gate.cjs");
const YAML = require("yaml") as { parse(value: string): unknown };
const marketplaceCli = {
  "validate-plugins.cjs": require("../scripts/validate-plugins.cjs"),
  "generate-marketplace.cjs": require("../scripts/generate-marketplace.cjs"),
  "validate-marketplace.cjs": require("../scripts/validate-marketplace.cjs"),
} as const;
const temporaryRoots: string[] = [];

function createFixture(): string {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "codex-essentials-marketplace-")),
  );
  temporaryRoots.push(root);
  for (const name of ["plugins", "schemas", "templates", "scripts"] as const) {
    cpSync(join(repositoryRoot, name), join(root, name), { recursive: true });
  }
  cpSync(
    join(repositoryRoot, "schemas", "agent.schema.json"),
    join(root, "schemas", "agent.schema.json"),
  );
  cpSync(join(repositoryRoot, "package.json"), join(root, "package.json"));
  return root;
}

function run(root: string, script: string) {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  try {
    const status = marketplaceCli[script as keyof typeof marketplaceCli].run([
      "--root",
      root,
    ]);
    return {
      status,
      stdout: log.mock.calls.flat().join("\n"),
      stderr: error.mock.calls.flat().join("\n"),
    };
  } finally {
    log.mockRestore();
    error.mockRestore();
  }
}

function runExecutable(root: string, script: string) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", script), "--root", root],
    { encoding: "utf8" },
  );
}

function runGuard(root: string, event: unknown) {
  return spawnSync(
    process.execPath,
    [join(repositoryRoot, "scripts", "plugin-manifest-guard.cjs")],
    {
      cwd: root,
      encoding: "utf8",
      input: JSON.stringify(event),
      env: {
        ...process.env,
        CODEX_ESSENTIALS_REPOSITORY_ROOT: root,
        NODE_PATH: join(repositoryRoot, "node_modules"),
      },
    },
  );
}

function runDocumentationGate(
  root: string,
  base: string,
  head: string,
  metadata: { title?: string; authorType?: string; labels?: string } = {},
) {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  try {
    const status = documentationGate.run(
      [
        "--root",
        root,
        "--base",
        base,
        "--head",
        head,
        "--title",
        metadata.title ?? "",
        "--author-type",
        metadata.authorType ?? "",
        "--labels",
        metadata.labels ?? "",
      ],
      console,
    );
    return {
      status,
      stdout: log.mock.calls.flat().join("\n"),
      stderr: error.mock.calls.flat().join("\n"),
    };
  } finally {
    log.mockRestore();
    error.mockRestore();
  }
}

function git(root: string, args: string[]): string {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  return result.stdout.trim();
}

function readJson(root: string, relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8")) as unknown;
}

function findAgentManifests(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.name === ".git" || entry.name === "node_modules") return [];
      const target = join(directory, entry.name);
      if (entry.isDirectory()) return findAgentManifests(target);
      if (
        entry.isFile() &&
        (entry.name === "openai.yaml" || entry.name === "openai.yml")
      ) {
        return [target];
      }
      return [];
    })
    .sort();
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("strict plugin-to-marketplace pipeline", () => {
  it("declares an explicit boolean invocation policy in every repository agent manifest", () => {
    const manifests = findAgentManifests(repositoryRoot);

    expect(manifests.length).toBeGreaterThan(0);
    for (const manifest of manifests) {
      const agent = YAML.parse(readFileSync(manifest, "utf8")) as {
        policy?: { allow_implicit_invocation?: unknown };
      };
      expect(typeof agent.policy?.allow_implicit_invocation).toBe("boolean");
    }
  });

  it("keeps the agent-manifest template schema-valid and explicit", () => {
    const root = createFixture();
    const template = YAML.parse(
      readFileSync(join(root, "templates", "agents-openai.yaml"), "utf8"),
    );

    expect(() =>
      marketplaceContract.validate(
        readJson(root, "schemas/agent.schema.json"),
        template,
        "agent-manifest template",
      ),
    ).not.toThrow();
    expect(template).toMatchObject({
      policy: { allow_implicit_invocation: true },
    });
  });

  it("exposes routine and explicit deep repo-hygiene modes", () => {
    const root = createFixture();
    const skillsRoot = join(root, "plugins", "repo-hygiene", "skills");

    expect(
      readdirSync(skillsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => entry.name)
        .sort(),
    ).toEqual(["debug", "deep", "routine"]);

    const routine = YAML.parse(
      readFileSync(
        join(skillsRoot, "routine", "agents", "openai.yaml"),
        "utf8",
      ),
    ) as { policy: { allow_implicit_invocation: boolean } };
    const deep = YAML.parse(
      readFileSync(join(skillsRoot, "deep", "agents", "openai.yaml"), "utf8"),
    ) as { policy: { allow_implicit_invocation: boolean } };
    const debug = YAML.parse(
      readFileSync(join(skillsRoot, "debug", "agents", "openai.yaml"), "utf8"),
    ) as { policy: { allow_implicit_invocation: boolean } };

    expect(routine.policy.allow_implicit_invocation).toBe(true);
    expect(deep.policy.allow_implicit_invocation).toBe(false);
    expect(debug.policy.allow_implicit_invocation).toBe(false);
  });

  it("keeps senior Git guidance partitioned by hygiene mode", () => {
    const root = createFixture();
    const skillsRoot = join(root, "plugins", "repo-hygiene", "skills");

    for (const reference of [
      "routine/references/routine-hygiene.md",
      "debug/references/debugging-with-git.md",
      "deep/references/revisions-and-integration.md",
      "deep/references/topology-and-recovery.md",
      "deep/references/object-store-and-provenance.md",
    ]) {
      expect(() =>
        readFileSync(join(skillsRoot, reference), "utf8"),
      ).not.toThrow();
    }
  });

  it("requires an approved recommendation plan before repo-hygiene mutates state", () => {
    const root = createFixture();
    const skillsRoot = join(root, "plugins", "repo-hygiene", "skills");

    for (const skill of ["routine", "deep", "debug"]) {
      const instructions = readFileSync(
        join(skillsRoot, skill, "SKILL.md"),
        "utf8",
      );
      expect(instructions).toContain("recommendation plan");
      expect(instructions).toContain("approved item IDs");
    }
  });

  it("requires a comprehensible audit report before repo-hygiene asks for approval", () => {
    const root = createFixture();
    const skillsRoot = join(root, "plugins", "repo-hygiene", "skills");

    for (const skill of ["routine", "deep", "debug"]) {
      const instructions = readFileSync(
        join(skillsRoot, skill, "SKILL.md"),
        "utf8",
      );
      expect(instructions).toContain("User-Facing Audit Report");
      expect(instructions).toContain("plain-language summary");
      expect(instructions).toContain("Evidence and scope");
      expect(instructions).toContain("Recommendations awaiting approval");
    }
  });

  it("exposes each pipeline CLI for instrumented execution", () => {
    for (const cli of Object.values(marketplaceCli)) {
      expect(cli.main).toBeTypeOf("function");
      expect(cli.run).toBeTypeOf("function");
    }
  });

  it("executes every marketplace CLI as a Node entrypoint", () => {
    const root = createFixture();
    for (const script of [
      "validate-plugins.cjs",
      "generate-marketplace.cjs",
      "validate-marketplace.cjs",
    ]) {
      expect(runExecutable(root, script).status).toBe(0);
    }
  });

  it("preserves every marketplace CLI failure exit code", () => {
    const root = createFixture();
    const missingRoot = join(root, "missing-root");

    for (const script of [
      "validate-plugins.cjs",
      "generate-marketplace.cjs",
      "validate-marketplace.cjs",
    ]) {
      const result = runExecutable(missingRoot, script);
      expect(result.status).toBe(1);
      expect(result.stderr).not.toBe("");
    }
  });

  it("rejects invalid contract inputs at every filesystem and schema boundary", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    const missing = join(root, "missing");
    const linkedRoot = join(tmpdir(), `codex-essentials-link-${Date.now()}`);
    symlinkSync(root, linkedRoot);
    temporaryRoots.push(linkedRoot);

    expect(marketplaceContract.resolveRootFromArgs([], root)).toBe(root);
    expect(() =>
      marketplaceContract.resolveRootFromArgs(["--root"], root),
    ).toThrow("usage: --root <repository-root>");
    expect(() => marketplaceContract.asRecord(null, "value")).toThrow(
      "value must be an object",
    );
    expect(() => marketplaceContract.asRecord([], "value")).toThrow(
      "value must be an object",
    );
    expect(marketplaceContract.hookPaths("./hooks.json")).toEqual([
      "./hooks.json",
    ]);
    expect(marketplaceContract.hookPaths([])).toEqual([]);
    expect(() => marketplaceContract.hookPaths(["./hooks.json", 1])).toThrow(
      "hooks path array must contain only paths",
    );
    expect(() =>
      marketplaceContract.resolvePluginPath(pluginRoot, "hooks.json", "hooks"),
    ).toThrow("hooks path must start with ./");
    expect(() =>
      marketplaceContract.resolvePluginPath(pluginRoot, "./../escape", "hooks"),
    ).toThrow("remain inside the plugin root");
    expect(() =>
      marketplaceContract.resolvePluginPath(pluginRoot, "./", "hooks"),
    ).toThrow("resolves outside the plugin root");
    expect(() =>
      marketplaceContract.assertContained(root, missing, "missing"),
    ).toThrow();
    expect(() =>
      marketplaceContract.assertRegularFile(missing, "missing"),
    ).toThrow("missing is missing");
    expect(() =>
      marketplaceContract.assertDirectory(missing, "missing"),
    ).toThrow("missing is missing");
    expect(() =>
      marketplaceContract.loadJson(join(root, "package.json"), "package"),
    ).not.toThrow();
    writeFileSync(join(root, "invalid.json"), "{");
    expect(() =>
      marketplaceContract.loadJson(join(root, "invalid.json"), "invalid"),
    ).toThrow("unable to load invalid");
    writeFileSync(join(root, "invalid.yaml"), "field: [");
    expect(() =>
      marketplaceContract.loadYaml(join(root, "invalid.yaml"), "invalid"),
    ).toThrow("unable to load invalid");
    expect(() => marketplaceContract.buildMarketplace(linkedRoot, [])).toThrow(
      "repository root must not be a symbolic link",
    );
    expect(() =>
      marketplaceContract.assertUniqueMarketplacePluginNames({
        plugins: [{ name: "duplicate" }, { name: "duplicate" }],
      }),
    ).toThrow("marketplace plugin name must be unique");
    expect(() =>
      marketplaceContract.assertUniqueMarketplacePluginNames({
        plugins: [{ name: 1 }],
      }),
    ).toThrow("marketplace plugin entry name must be a string");
    expect(() =>
      marketplaceContract.assertFunctionalComponent({}, "manifest"),
    ).toThrow("functional component");
    expect(() =>
      marketplaceContract.getField(
        { missing: null },
        ["missing", "child"],
        "manifest",
      ),
    ).toThrow("manifest must be an object");
    expect(() =>
      marketplaceContract.validate({ type: "string" }, 1, "payload"),
    ).toThrow("payload is invalid");
  });

  it("exercises defensive marketplace package guards", () => {
    const root = createFixture();
    const pluginsRoot = join(root, "plugins");
    writeFileSync(join(pluginsRoot, "AGENTS.md"), "instructions\n");
    expect(marketplaceContract.loadPluginManifests(root)).toHaveLength(15);

    const invalidEntryRoot = createFixture();
    writeFileSync(join(invalidEntryRoot, "plugins", "not-a-plugin.txt"), "x");
    expect(() =>
      marketplaceContract.loadPluginManifests(invalidEntryRoot),
    ).toThrow("must be a real plugin directory");

    const emptyRoot = createFixture();
    rmSync(join(emptyRoot, "plugins"), { recursive: true });
    mkdirSync(join(emptyRoot, "plugins"));
    expect(() => marketplaceContract.loadPluginManifests(emptyRoot)).toThrow(
      "at least one plugin",
    );

    const mismatchedRoot = createFixture();
    const mismatchPath = join(
      mismatchedRoot,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    );
    const mismatch = readJson(
      mismatchedRoot,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    mismatch["name"] = "wrong-name";
    writeFileSync(mismatchPath, `${JSON.stringify(mismatch, null, 2)}\n`);
    expect(() =>
      marketplaceContract.loadPluginManifests(mismatchedRoot),
    ).toThrow("name must match");

    const pluginRoot = join(root, "plugins", "doc-keeper");
    expect(() =>
      marketplaceContract.validateDeclaredComponents(pluginRoot, {}),
    ).toThrow("skills must declare");
    expect(() =>
      marketplaceContract.validateDeclaredComponents(join(root, "missing"), {
        skills: "./skills",
      }),
    ).toThrow("./skills is missing");

    const emptySkills = join(root, "empty-skills");
    mkdirSync(emptySkills);
    expect(() =>
      marketplaceContract.assertSkillDirectory(
        emptySkills,
        "./skills",
        readJson(root, "schemas/agent.schema.json"),
      ),
    ).toThrow("at least one skill directory");
    writeFileSync(join(emptySkills, "not-a-directory"), "file\n");
    expect(() =>
      marketplaceContract.assertSkillDirectory(
        emptySkills,
        "./skills",
        readJson(root, "schemas/agent.schema.json"),
      ),
    ).toThrow("must be a real directory");

    expect(() =>
      marketplaceContract.assertRegularFile(pluginRoot, "plugin"),
    ).toThrow("must be a regular file");
    expect(() =>
      marketplaceContract.assertDirectory(
        join(pluginRoot, "README.md"),
        "readme",
      ),
    ).toThrow("must be a real directory");
    expect(() =>
      marketplaceContract.assertContained(root, tmpdir(), "temporary"),
    ).toThrow("resolves outside");
  });

  it("rejects unsafe catalog writes and malformed optional resources", () => {
    const root = createFixture();
    const marketplace = marketplaceContract.buildMarketplace(
      root,
      marketplaceContract.loadPluginManifests(root),
    );
    const catalogDirectory = join(root, ".agents", "plugins");
    mkdirSync(catalogDirectory, { recursive: true });
    const catalogPath = join(catalogDirectory, "marketplace.json");
    symlinkSync(join(root, "package.json"), catalogPath);
    expect(() =>
      marketplaceContract.writeMarketplace(root, marketplace),
    ).toThrow("must not be a symbolic link");
    rmSync(catalogPath);
    writeFileSync(`${catalogPath}.tmp`, "stale\n");
    expect(() =>
      marketplaceContract.writeMarketplace(root, marketplace),
    ).toThrow(".tmp already exists");
    rmSync(`${catalogPath}.tmp`);

    const pluginRoot = join(root, "plugins", "doc-keeper");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["interface"] = { screenshots: ["./README.md"] };
    expect(() =>
      marketplaceContract.validatePluginResources(
        pluginRoot,
        manifest,
        readJson(root, "schemas/agent.schema.json"),
        readJson(root, "schemas/hooks.schema.json"),
      ),
    ).not.toThrow();

    const changelog = join(pluginRoot, "CHANGELOG.md");
    writeFileSync(changelog, "# Changelog\n");
    expect(() =>
      marketplaceContract.validatePluginDocumentation(pluginRoot, "plugin"),
    ).toThrow("must contain an Unreleased section");

    expect(() =>
      marketplaceContract.validateFixedTemplateFields(
        { author: { name: "wrong" } },
        { author: { name: "expected" } },
        "manifest",
      ),
    ).toThrow("must equal the fixed template value");
  });

  it("validates optional skill icons and rejects non-string screenshots", () => {
    const root = createFixture();
    const skillRoot = join(
      root,
      "plugins",
      "doc-keeper",
      "skills",
      "doc-keeper",
    );
    const agentPath = join(skillRoot, "agents", "openai.yaml");
    mkdirSync(join(skillRoot, "assets"));
    writeFileSync(join(skillRoot, "assets", "icon.png"), "png");
    writeFileSync(
      agentPath,
      readFileSync(agentPath, "utf8").replace(
        "\npolicy:\n",
        "\n  icon_small: ./assets/icon.png\n\npolicy:\n",
      ),
    );
    expect(() =>
      marketplaceContract.assertSkillDirectory(
        join(root, "plugins", "doc-keeper", "skills"),
        "./skills",
        readJson(root, "schemas/agent.schema.json"),
      ),
    ).not.toThrow();

    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    mkdirSync(join(root, "plugins", "doc-keeper", "assets"));
    writeFileSync(
      join(root, "plugins", "doc-keeper", "assets", "icon.png"),
      "x",
    );
    manifest["interface"] = { composerIcon: "./assets/icon.png" };
    expect(() =>
      marketplaceContract.validatePluginResources(
        join(root, "plugins", "doc-keeper"),
        manifest,
        readJson(root, "schemas/agent.schema.json"),
        readJson(root, "schemas/hooks.schema.json"),
      ),
    ).not.toThrow();
    manifest["interface"] = { screenshots: [1] };
    expect(() =>
      marketplaceContract.validatePluginResources(
        join(root, "plugins", "doc-keeper"),
        manifest,
        readJson(root, "schemas/agent.schema.json"),
        readJson(root, "schemas/hooks.schema.json"),
      ),
    ).toThrow("screenshots must contain only paths");

    const barePlugin = join(root, "bare-plugin");
    mkdirSync(barePlugin);
    expect(() =>
      marketplaceContract.validatePluginResources(
        barePlugin,
        { interface: {} },
        readJson(root, "schemas/agent.schema.json"),
        readJson(root, "schemas/hooks.schema.json"),
      ),
    ).not.toThrow();

    writeFileSync(join(barePlugin, ".app.json"), "{}\n");
    expect(() =>
      marketplaceContract.validatePluginResources(
        barePlugin,
        { apps: "./.app.json", interface: {} },
        readJson(root, "schemas/agent.schema.json"),
        readJson(root, "schemas/hooks.schema.json"),
      ),
    ).not.toThrow();
  });

  it("validates referenced MCP configuration shape directly", () => {
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        {
          svelte: { url: "https://mcp.svelte.dev/mcp" },
        },
        "mcp",
      ),
    ).not.toThrow();
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        {
          mcp_servers: {
            docs: {
              command: "docs-mcp",
              args: ["--stdio"],
              env: { DOCS_TOKEN: "${DOCS_TOKEN}" },
            },
          },
        },
        "mcp",
      ),
    ).not.toThrow();
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        {
          mcpServers: {
            svelte: {
              type: "http",
              url: "https://mcp.svelte.dev/mcp",
            },
          },
        },
        "mcp",
      ),
    ).not.toThrow();
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        {
          mcpServers: {
            svelte: {
              type: "http",
              url: "https://mcp.svelte.dev/mcp",
            },
          },
          typo: {},
        },
        "mcp",
      ),
    ).toThrow("wrapped configuration must contain exactly one top-level key");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { mcp_servers: {} },
        "mcp",
      ),
    ).toThrow("at least one server");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { "bad.name": { command: "server" } },
        "mcp",
      ),
    ).toThrow("server name is invalid");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", note: "unsupported" } },
        "mcp",
      ),
    ).toThrow("not a supported MCP server field");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { type: "bogus", url: "https://mcp.dev" } },
        "mcp",
      ),
    ).toThrow("type is not a supported MCP server field");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", type: "http" } },
        "mcp",
      ),
    ).toThrow("type is not a supported MCP server field");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", url: "https://mcp.dev" } },
        "mcp",
      ),
    ).toThrow("exactly one");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: {} },
        "mcp",
      ),
    ).toThrow("exactly one");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", args: [1] } },
        "mcp",
      ),
    ).toThrow("array of strings");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", env: {} } },
        "mcp",
      ),
    ).toThrow("must not be empty");
    expect(() =>
      marketplaceContract.validateReferencedMcpConfiguration(
        { bad: { command: "server", env: { TOKEN: 1 } } },
        "mcp",
      ),
    ).toThrow("map non-empty keys");
  });

  it("validates all complete manifests, generates the catalog, and reverse-validates it", () => {
    const root = createFixture();

    expect(run(root, "validate-plugins.cjs").status).toBe(0);
    expect(run(root, "generate-marketplace.cjs").status).toBe(0);
    expect(run(root, "validate-marketplace.cjs").status).toBe(0);
    expect(readJson(root, ".agents/plugins/marketplace.json")).toMatchObject({
      name: "codex-essentials",
      plugins: [
        { name: "astro-cli-commands" },
        {
          name: "block-no-verify",
          source: {
            source: "local",
            path: "./plugins/block-no-verify",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL",
          },
          category: "Security",
        },
        { name: "configure-prettier" },
        { name: "doc-keeper" },
        { name: "hook-creator" },
        { name: "live-research" },
        { name: "optimize-memories" },
        { name: "prettier-after-edit" },
        { name: "prompt-architect" },
        {
          name: "repo-hygiene",
          source: {
            source: "local",
            path: "./plugins/repo-hygiene",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL",
          },
          category: "Developer Tools",
        },
        { name: "repo-maintenance" },
        {
          name: "ruff-after-edit",
          source: {
            source: "local",
            path: "./plugins/ruff-after-edit",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL",
          },
          category: "Developer Tools",
        },
        {
          name: "skill-design-standards",
          source: {
            source: "local",
            path: "./plugins/skill-design-standards",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_INSTALL",
          },
          category: "Developer Tools",
        },
        { name: "svelte-development" },
        { name: "system-ops-audit" },
      ],
    });
  });

  it("rejects a manifest that violates fixed template metadata before writing the catalog", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as {
      author: { email: string };
    };
    manifest.author.email = "wrong@example.com";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const sentinel = '{"catalog":"unchanged"}\n';
    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    cpSync(join(repositoryRoot, ".agents"), join(root, ".agents"), {
      recursive: true,
    });
    writeFileSync(catalogPath, sentinel);

    const validation = run(root, "validate-plugins.cjs");
    const generation = run(root, "generate-marketplace.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("author.email");
    expect(generation.status).not.toBe(0);
    expect(readFileSync(catalogPath, "utf8")).toBe(sentinel);
  });

  it("rejects an undeclared or missing bundled component", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "astro-cli-commands",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/astro-cli-commands/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = "./.mcp.json";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain(".mcp.json is missing");
  });

  it("accepts an inline remote HTTP MCP server map", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = {
      docs: { type: "http", url: "https://docs.example.com/mcp" },
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).toBe(0);
  });

  it("rejects an inline HTTP MCP transport without a URL", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = {
      docs: { command: "docs-mcp", type: "http" },
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("must have property url");
  });

  it("accepts a referenced remote MCP server configuration", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = "./.mcp.json";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(
      join(pluginRoot, ".mcp.json"),
      `${JSON.stringify(
        {
          mcp_servers: {
            svelte: { url: "https://mcp.svelte.dev/mcp" },
          },
        },
        null,
        2,
      )}\n`,
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).toBe(0);
  });

  it("rejects structurally invalid referenced MCP server configuration", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    manifest["mcpServers"] = "./.mcp.json";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(
      join(pluginRoot, ".mcp.json"),
      `${JSON.stringify(
        {
          mcp_servers: {
            svelte: { url: "http://mcp.svelte.dev/mcp" },
          },
        },
        null,
        2,
      )}\n`,
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain(".mcp.json");
    expect(validation.stderr).toContain("https URL");
  });

  it("rejects malformed referenced hook configuration", () => {
    const root = createFixture();
    const hookPath = join(
      root,
      "plugins",
      "prettier-after-edit",
      "hooks",
      "hooks.json",
    );
    writeFileSync(hookPath, "{\n");

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("hooks.json");
  });

  it("rejects structurally invalid referenced hook configuration", () => {
    const root = createFixture();
    const hookPath = join(
      root,
      "plugins",
      "prettier-after-edit",
      "hooks",
      "hooks.json",
    );
    writeFileSync(
      hookPath,
      `${JSON.stringify(
        {
          hooks: {
            PostToolUse: [
              {
                hooks: [{ type: "not-a-command", command: "true" }],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("hooks.json");
  });

  it("rejects a plugin manifest without a functional component", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    rmSync(join(pluginRoot, "skills"), { recursive: true });
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as Record<string, unknown>;
    delete manifest["skills"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("functional component");
  });

  it("requires README and changelog changes for product plugin changes", () => {
    const root = createFixture();
    git(root, ["init"]);
    git(root, ["config", "user.email", "test@example.com"]);
    git(root, ["config", "user.name", "Test"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "fixture"]);
    const base = git(root, ["rev-parse", "HEAD"]);
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    writeFileSync(
      manifestPath,
      `${readFileSync(manifestPath, "utf8").replace("0.1.0", "0.1.1")}\n`,
    );
    git(root, ["add", manifestPath]);
    git(root, ["commit", "-m", "manifest change"]);
    const headWithoutDocs = git(root, ["rev-parse", "HEAD"]);

    const failure = runDocumentationGate(root, base, headWithoutDocs);

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain("README.md");
    expect(failure.stderr).toContain("CHANGELOG.md");

    for (const file of [
      "plugins/doc-keeper/README.md",
      "plugins/doc-keeper/CHANGELOG.md",
    ]) {
      const target = join(root, file);
      writeFileSync(
        target,
        `${readFileSync(target, "utf8")}\nDocumentation update.\n`,
      );
    }
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "document manifest change"]);
    const headWithDocs = git(root, ["rev-parse", "HEAD"]);

    expect(runDocumentationGate(root, base, headWithDocs).status).toBe(0);

    const emptyReadme = join(root, "plugins", "doc-keeper", "README.md");
    writeFileSync(emptyReadme, "");
    git(root, ["add", emptyReadme]);
    git(root, ["commit", "-m", "empty readme"]);
    const headWithEmptyReadme = git(root, ["rev-parse", "HEAD"]);

    const emptyGate = runDocumentationGate(
      root,
      headWithDocs,
      headWithEmptyReadme,
    );

    expect(emptyGate.status).not.toBe(0);
    expect(emptyGate.stderr).toContain("README.md must not be empty");
    expect(run(root, "validate-plugins.cjs").status).not.toBe(0);

    const deletedRoot = createFixture();
    git(deletedRoot, ["init"]);
    git(deletedRoot, ["config", "user.email", "test@example.com"]);
    git(deletedRoot, ["config", "user.name", "Test"]);
    git(deletedRoot, ["add", "."]);
    git(deletedRoot, ["commit", "-m", "fixture"]);
    const deletedBase = git(deletedRoot, ["rev-parse", "HEAD"]);
    const deletedReadme = join(
      deletedRoot,
      "plugins",
      "doc-keeper",
      "README.md",
    );
    rmSync(deletedReadme);
    git(deletedRoot, ["add", "-A"]);
    git(deletedRoot, ["commit", "-m", "delete readme"]);
    const deletedHead = git(deletedRoot, ["rev-parse", "HEAD"]);

    const deletedGate = runDocumentationGate(
      deletedRoot,
      deletedBase,
      deletedHead,
    );

    expect(deletedGate.status).not.toBe(0);
    expect(deletedGate.stderr).toContain("README.md must exist");
  });

  it("rejects plugin diffs that add an unmasked credential", () => {
    const root = createFixture();
    git(root, ["init"]);
    git(root, ["config", "user.email", "test@example.com"]);
    git(root, ["config", "user.name", "Test"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "fixture"]);
    const base = git(root, ["rev-parse", "HEAD"]);
    const readme = join(root, "plugins", "doc-keeper", "README.md");
    const unmasked = `${["api", "key"].join("_")}=${["live", "value"].join("-")}`;
    writeFileSync(readme, `${readFileSync(readme, "utf8")}\n${unmasked}\n`);
    git(root, ["add", readme]);
    git(root, ["commit", "-m", "add credential"]);
    const headWithCredential = git(root, ["rev-parse", "HEAD"]);

    const failure = runDocumentationGate(root, base, headWithCredential);

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain("unmasked credential");

    writeFileSync(readme, `${readFileSync(readme, "utf8")}\ntoken=\${TOKEN}\n`);
    git(root, ["add", readme]);
    git(root, ["commit", "-m", "mask credential"]);
    const headMasked = git(root, ["rev-parse", "HEAD"]);

    expect(
      runDocumentationGate(root, headWithCredential, headMasked).status,
    ).toBe(0);
  });

  it("rejects plugin diffs that add a quoted unmasked credential", () => {
    const root = createFixture();
    git(root, ["init"]);
    git(root, ["config", "user.email", "test@example.com"]);
    git(root, ["config", "user.name", "Test"]);
    git(root, ["add", "."]);
    git(root, ["commit", "-m", "fixture"]);
    const base = git(root, ["rev-parse", "HEAD"]);
    const readme = join(root, "plugins", "doc-keeper", "README.md");
    const unmasked = `${["api", "key"].join("_")}="${["live", "value"].join("-")}"`;
    writeFileSync(readme, `${readFileSync(readme, "utf8")}\n${unmasked}\n`);
    git(root, ["add", readme]);
    git(root, ["commit", "-m", "add quoted credential"]);
    const headWithCredential = git(root, ["rev-parse", "HEAD"]);

    const failure = runDocumentationGate(root, base, headWithCredential);

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain("unmasked credential");
  });

  it("fails closed for invalid Git revisions and unchanged invalid plugin documents", () => {
    const root = createFixture();
    const changelog = join(root, "plugins", "doc-keeper", "CHANGELOG.md");
    writeFileSync(changelog, "# Changelog\n");

    expect(() =>
      documentationGate.validatePluginDocumentation(root, [
        "README.md",
        "plugins/doc-keeper/CHANGELOG.md",
      ]),
    ).toThrow("CHANGELOG.md must contain an Unreleased section");

    const result = runDocumentationGate(root, "missing-base", "missing-head");

    expect(result.status).toBe(1);
    expect(result.stderr).not.toBe("");
  });

  it("parses every documentation-gate option and reports Git discovery failures", () => {
    const root = createFixture();

    expect(
      documentationGate.parseArguments(
        ["--base", "base", "--head", "head"],
        root,
      ),
    ).toEqual({
      root,
      base: "base",
      head: "head",
      title: "",
      authorType: "",
      labels: "",
    });
    expect(
      documentationGate.parseArguments(
        ["--head", "head", "--root", root, "--base", "base"],
        "unused-root",
      ),
    ).toEqual({
      root,
      base: "base",
      head: "head",
      title: "",
      authorType: "",
      labels: "",
    });
    expect(() => documentationGate.parseArguments(["--base"], root)).toThrow(
      "usage: --base <base> --head <head>",
    );
    expect(() => documentationGate.parseArguments([], root)).toThrow(
      "usage: --base <base> --head <head>",
    );
    expect(() =>
      documentationGate.parseArguments(
        ["--unexpected", "value", "--base", "base", "--head", "head"],
        root,
      ),
    ).toThrow("usage: --base <base> --head <head>");
    expect(() =>
      documentationGate.changedPluginFiles(
        root,
        "missing-base",
        "missing-head",
      ),
    ).toThrow();
    expect(() =>
      documentationGate.changedPluginFiles(root, "base", "head", () => ({
        status: 1,
        stderr: "",
        stdout: "",
      })),
    ).toThrow("unable to inspect plugin changes");
    expect(() =>
      documentationGate.pluginDiffText(root, "base", "head", () => ({
        status: 1,
        stderr: "",
        stdout: "",
      })),
    ).toThrow("unable to inspect plugin diff");
  });

  it("rejects a plugin README that omits a required operational section", () => {
    const root = createFixture();
    const readme = join(root, "plugins", "doc-keeper", "README.md");
    writeFileSync(
      readme,
      readFileSync(readme, "utf8").replace("## Permissions", "## Access Model"),
    );

    const validation = run(root, "validate-plugins.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain(
      "README.md is missing required section: Permissions",
    );
  });

  it("rejects a non-PNG screenshot path and accepts a PNG screenshot", () => {
    const root = createFixture();
    const pluginRoot = join(root, "plugins", "doc-keeper");
    const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as { interface: Record<string, unknown> };
    const assets = join(pluginRoot, "assets");
    mkdirSync(assets, { recursive: true });
    writeFileSync(join(assets, "screenshot.jpg"), "jpeg");
    manifest.interface["screenshots"] = ["./assets/screenshot.jpg"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const jpegValidation = run(root, "validate-plugins.cjs");

    expect(jpegValidation.status).not.toBe(0);
    expect(jpegValidation.stderr).toContain("screenshots");

    const png = Buffer.from(
      "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db00000000049454e44ae426082",
      "hex",
    );
    writeFileSync(join(assets, "screenshot.png"), png);
    manifest.interface["screenshots"] = ["./assets/screenshot.png"];
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    expect(run(root, "validate-plugins.cjs").status).toBe(0);
  });

  it("rejects missing skill agent metadata and symlinks anywhere in a plugin package", () => {
    const root = createFixture();
    rmSync(
      join(
        root,
        "plugins",
        "astro-cli-commands",
        "skills",
        "astro-commands",
        "agents",
        "openai.yaml",
      ),
    );
    expect(run(root, "validate-plugins.cjs").status).not.toBe(0);

    const secondRoot = createFixture();
    symlinkSync(
      "/tmp",
      join(secondRoot, "plugins", "astro-cli-commands", "unexpected-link"),
    );
    expect(run(secondRoot, "validate-plugins.cjs").status).not.toBe(0);
  });

  it("rejects skill agent metadata without an explicit implicit-invocation policy", () => {
    const root = createFixture();
    const agentPath = join(
      root,
      "plugins",
      "astro-cli-commands",
      "skills",
      "astro-commands",
      "agents",
      "openai.yaml",
    );
    writeFileSync(
      agentPath,
      [
        "interface:",
        '  display_name: "Astro Commands"',
        '  short_description: "Use Astro commands"',
        "",
      ].join("\n"),
    );

    const validation = run(root, "validate-plugins.cjs");
    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("policy");

    writeFileSync(
      agentPath,
      [
        "interface:",
        '  display_name: "Astro Commands"',
        '  short_description: "Use Astro commands"',
        "policy:",
        "  allow_implicit_invocation: false",
        "",
      ].join("\n"),
    );
    const explicitOnlyPolicy = run(root, "validate-plugins.cjs");
    expect(explicitOnlyPolicy.status).toBe(0);
  });

  it("rejects a catalog whose entries no longer exactly derive from the manifests", () => {
    const root = createFixture();
    expect(run(root, "generate-marketplace.cjs").status).toBe(0);

    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    const catalog = readJson(root, ".agents/plugins/marketplace.json") as {
      plugins: Array<{ category: string }>;
    };
    catalog.plugins[0]!.category = "Security";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    const validation = run(root, "validate-marketplace.cjs");

    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toContain("does not exactly match");
  });

  it("stops the Codex turn and preserves the catalog when a manifest edit breaks the pipeline", () => {
    const root = createFixture();
    const manifestPath = join(
      root,
      "plugins",
      "doc-keeper",
      ".codex-plugin",
      "plugin.json",
    );
    const manifest = readJson(
      root,
      "plugins/doc-keeper/.codex-plugin/plugin.json",
    ) as {
      interface: { category: string };
    };
    manifest.interface.category = "Invalid category";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const sentinel = '{"catalog":"unchanged"}\n';
    cpSync(join(repositoryRoot, ".agents"), join(root, ".agents"), {
      recursive: true,
    });
    const catalogPath = join(root, ".agents", "plugins", "marketplace.json");
    writeFileSync(catalogPath, sentinel);

    const guard = runGuard(root, {
      tool_input: {
        patch: `*** Begin Patch\n*** Update File: plugins/doc-keeper/.codex-plugin/plugin.json\n*** End Patch`,
      },
      hook_event_name: "PostToolUse",
    });

    expect(guard.status).toBe(0);
    expect(JSON.parse(guard.stdout) as { continue: boolean }).toMatchObject({
      continue: false,
    });
    expect(readFileSync(catalogPath, "utf8")).toBe(sentinel);
  });

  it("stops the Codex turn when the post-generation reverse validation fails", () => {
    const root = createFixture();
    const packagePath = join(root, "package.json");
    const packageJson = readJson(root, "package.json") as {
      scripts: Record<string, string>;
    };
    packageJson.scripts["validate:marketplace"] =
      'node -e "process.exitCode = 1"';
    writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const guard = runGuard(root, {
      tool_input: {
        patch: "*** Update File: plugins/doc-keeper/.codex-plugin/plugin.json",
      },
      hook_event_name: "PostToolUse",
    });

    expect(guard.status).toBe(0);
    expect(JSON.parse(guard.stdout) as { continue: boolean }).toMatchObject({
      continue: false,
    });
  });
});
