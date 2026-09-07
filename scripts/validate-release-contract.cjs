#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { formatError } = require("./error-utils.cjs");
const {
  loadPluginManifests,
  resolveRootFromArgs,
} = require("./marketplace-contract.cjs");

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const TAG = /^plugin\/([a-z0-9][a-z0-9-]*)\/v(.+)$/u;
const FORBIDDEN =
  /\b(?:npm\s+publish|gh\s+release\s+upload|upload-artifact|upload-release-asset|softprops\/action-gh-release|git\s+archive|sha(?:256|512)sum)\b/iu;

function parseTag(tag) {
  const match = TAG.exec(tag);
  if (!match || !SEMVER.test(match[2])) {
    throw new Error(`invalid release tag: ${tag}`);
  }
  return { pluginId: match[1], version: match[2] };
}

function validateUnreleased(changelogPath) {
  const text = fs.readFileSync(changelogPath, "utf8");
  const match =
    /^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[|$(?![\s\S]))/mu.exec(text);
  if (!match || !match[1].replace(/<!--([\s\S]*?)-->/gu, "").trim()) {
    throw new Error(
      `${changelogPath} must contain a non-empty ## [Unreleased]`,
    );
  }
}

function changedPaths(root, base, head, direct = false) {
  return execFileSync(
    "git",
    [
      "-C",
      root,
      "diff",
      "--name-only",
      direct ? `${base}..${head}` : `${base}...${head}`,
    ],
    {
      encoding: "utf8",
    },
  )
    .split("\n")
    .filter(Boolean);
}

function validateChangeRouting(root, base, head, direct) {
  const paths = changedPaths(root, base, head, direct);
  if (
    direct &&
    paths.some(
      (file) => !/^docs\/(?:audits|maintenance|superpowers)\//u.test(file),
    )
  ) {
    throw new Error("direct pushes may change only non-policy docs records");
  }
  const plugins = [
    ...new Set(
      paths
        .map((file) => /^plugins\/([^/]+)\//u.exec(file)?.[1])
        .filter((plugin) => typeof plugin === "string"),
    ),
  ];
  if (plugins.length === 0) {
    return;
  }
  for (const plugin of plugins) {
    const pluginPaths = paths.filter((file) =>
      file.startsWith(`plugins/${plugin}/`),
    );
    if (
      pluginPaths.every((file) => /\/(?:README|CHANGELOG)\.md$/u.test(file))
    ) {
      continue;
    }
    const subjects = execFileSync(
      "git",
      [
        "-C",
        root,
        "log",
        "--format=%s%n%b",
        `${base}...${head}`,
        "--",
        `plugins/${plugin}`,
      ],
      { encoding: "utf8" },
    );
    if (
      !/(?:^|\n)(?:feat|fix|perf)(?:\([^)]*\))?!?:|BREAKING CHANGE:|Release-As:/mu.test(
        subjects,
      )
    ) {
      throw new Error(
        `plugins/${plugin} requires a releasable Conventional Commit or Release-As`,
      );
    }
    validateUnreleased(path.join(root, "plugins", plugin, "CHANGELOG.md"));
  }
}

function validateRepository(root) {
  const plugins = loadPluginManifests(root);
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "release-please-config.json"), "utf8"),
  );
  const state = JSON.parse(
    fs.readFileSync(path.join(root, ".release-please-manifest.json"), "utf8"),
  );
  const expected = new Set(plugins.map((plugin) => `plugins/${plugin.name}`));
  const actual = new Set(Object.keys(config.packages ?? {}));
  if (
    expected.size !== actual.size ||
    [...expected].some((entry) => !actual.has(entry))
  ) {
    throw new Error(
      "Release Please components must exactly match plugin directories",
    );
  }
  for (const plugin of plugins) {
    const componentPath = `plugins/${plugin.name}`;
    validateUnreleased(path.join(plugin.pluginRoot, "CHANGELOG.md"));
    const component = config.packages[componentPath];
    if (component.component !== `plugin/${plugin.name}`) {
      throw new Error(`${componentPath} component name is invalid`);
    }
    if (
      !Array.isArray(component["extra-files"]) ||
      !component["extra-files"].some(
        (file) =>
          file.type === "json" &&
          file.path === ".codex-plugin/plugin.json" &&
          file.jsonpath === "$.version",
      )
    ) {
      throw new Error(`${componentPath} must update manifest version`);
    }
    if (
      typeof state[componentPath] !== "string" ||
      !SEMVER.test(state[componentPath])
    ) {
      throw new Error(`${componentPath} release state must be SemVer`);
    }
  }
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/release-please.yml"),
    "utf8",
  );
  if (FORBIDDEN.test(workflow)) {
    throw new Error(
      "release workflow must not publish or upload distribution artifacts",
    );
  }
}

function main(args = process.argv.slice(2)) {
  const tagIndex = args.indexOf("--tag");
  const baseIndex = args.indexOf("--base");
  const headIndex = args.indexOf("--head");
  const direct = args.includes("--direct");
  const tag = tagIndex === -1 ? undefined : args[tagIndex + 1];
  const consumed = new Set(
    [tagIndex, baseIndex, headIndex]
      .filter((index) => index !== -1)
      .flatMap((index) => [index, index + 1]),
  );
  const passthrough = args.filter(
    (_, index) => !consumed.has(index) && args[index] !== "--direct",
  );
  if (tagIndex !== -1 && !tag) {
    throw new Error("usage: --tag plugin/<id>/v<semver>");
  }
  const root = resolveRootFromArgs(passthrough, path.resolve(__dirname, ".."));
  validateRepository(root);
  if (baseIndex !== -1 || headIndex !== -1) {
    const base = args[baseIndex + 1];
    const head = args[headIndex + 1];
    if (!base || !head) {
      throw new Error("usage: --base <sha> --head <sha>");
    }
    validateChangeRouting(root, base, head, direct);
  }
  if (tag) {
    const parsed = parseTag(tag);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(
          root,
          "plugins",
          parsed.pluginId,
          ".codex-plugin/plugin.json",
        ),
        "utf8",
      ),
    );
    if (manifest.version !== parsed.version) {
      throw new Error(
        `${tag} does not match manifest version ${manifest.version}`,
      );
    }
  }
  console.log("Validated plugin versioning and no-artifact release contract.");
}
function run(args = process.argv.slice(2)) {
  try {
    main(args);
    return 0;
  } catch (error) {
    console.error(formatError(error));
    return 1;
  }
}
/* c8 ignore next 3 -- exercised through the child-process integration test. */
if (require.main === module) {
  process.exitCode = run();
}
module.exports = {
  changedPaths,
  main,
  parseTag,
  run,
  validateRepository,
  validateChangeRouting,
  validateUnreleased,
};
