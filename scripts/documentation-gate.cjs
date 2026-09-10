#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { formatError } = require("./error-utils.cjs");
const { isTrustedReleasePleasePullRequest } = require("./release-pr-auth.cjs");
const REQUIRED_PLUGIN_DOCUMENTS = ["README.md", "CHANGELOG.md"];
const CREDENTIAL_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|secret|password|token)\b\s*[:=]\s*(?!(?:["'`])?\$\{[A-Z][A-Z0-9_]*\}(?:["'`])?(?:\s|$))\S+/iu;

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let head;
  let title = "";
  let authorType = "";
  let labels = "";
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--base" ||
      argument === "--head" ||
      argument === "--title" ||
      argument === "--author-type" ||
      argument === "--labels"
    ) {
      if (
        value === undefined ||
        value.startsWith("--") ||
        (["--root", "--base", "--head"].includes(argument) && !value)
      ) {
        throw new Error(
          "usage: --base <base> --head <head> [--title <title>] [--author-type <type>] [--labels <comma-separated-labels>]",
        );
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--base") {
        base = value;
      }
      if (argument === "--head") {
        head = value;
      }
      if (argument === "--title") {
        title = value;
      }
      if (argument === "--author-type") {
        authorType = value;
      }
      if (argument === "--labels") {
        labels = value;
      }
      index += 1;
    } else {
      throw new Error(
        "usage: --base <base> --head <head> [--title <title>] [--author-type <type>] [--labels <comma-separated-labels>]",
      );
    }
  }
  if (!base || !head) {
    throw new Error("usage: --base <base> --head <head>");
  }
  return { root, base, head, title, authorType, labels };
}

/** @param {string} root @param {string} base @param {string} head @param {typeof spawnSync} execute */
function changedPluginFiles(root, base, head, execute = spawnSync) {
  const result = execute(
    "git",
    ["diff", "--name-only", `${base}...${head}`, "--", "plugins"],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || "unable to inspect plugin changes").trim(),
    );
  }
  return (result.stdout || "")
    .split(/\r?\n/u)
    .map((file) => file.trim())
    .filter(Boolean);
}

/** @param {string} root @param {string} base @param {string} head @param {typeof spawnSync} execute */
function pluginDiffText(root, base, head, execute = spawnSync) {
  const result = execute(
    "git",
    ["diff", `${base}...${head}`, "--", "plugins"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error((result.stderr || "unable to inspect plugin diff").trim());
  }
  return result.stdout || "";
}

/** @param {string} diffText */
function addedDiffText(diffText) {
  return diffText
    .split(/\r?\n/u)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1))
    .join("\n");
}

/** @param {string} text */
function containsUnmaskedCredential(text) {
  return CREDENTIAL_PATTERN.test(text);
}

/** @param {string} root @param {string[]} files */
function validatePluginDocumentation(root, files, isReleasePleasePr = false) {
  const pluginFiles = new Map();
  for (const file of files) {
    const match = /^plugins\/([^/]+)\/(.+)$/u.exec(file);
    if (!match) {
      continue;
    }
    const pluginId = match[1];
    const relativeFile = match[2];
    const changed = pluginFiles.get(pluginId) || new Set();
    changed.add(relativeFile);
    pluginFiles.set(pluginId, changed);
  }
  const errors = [];
  for (const [pluginId, changed] of pluginFiles) {
    const productChanged = [...changed].some(
      (file) => file !== "README.md" && file !== "CHANGELOG.md",
    );
    if (!productChanged) {
      validateCurrentDocuments(root, pluginId, errors);
      continue;
    }
    if (!isReleasePleasePr && !changed.has("README.md")) {
      errors.push(
        `plugins/${pluginId}/README.md must change with product files`,
      );
    }
    if (!isReleasePleasePr && !changed.has("CHANGELOG.md")) {
      errors.push(
        `plugins/${pluginId}/CHANGELOG.md must change with product files`,
      );
    }
    validateCurrentDocuments(root, pluginId, errors);
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

/** @param {string} root @param {string} pluginId @param {string[]} errors */
function validateCurrentDocuments(root, pluginId, errors) {
  for (const document of REQUIRED_PLUGIN_DOCUMENTS) {
    const documentPath = path.join(root, "plugins", pluginId, document);
    let content;
    try {
      content = fs.readFileSync(documentPath, "utf8");
    } catch {
      errors.push(`plugins/${pluginId}/${document} must exist`);
      continue;
    }
    if (content.trim().length === 0) {
      errors.push(`plugins/${pluginId}/${document} must not be empty`);
    }
    if (
      document === "CHANGELOG.md" &&
      !/^## \[Unreleased\]\s*$/mu.test(content)
    ) {
      errors.push(
        `plugins/${pluginId}/CHANGELOG.md must contain an Unreleased section`,
      );
    }
  }
}

/** @param {string[]} args */
function main(args = process.argv.slice(2)) {
  const {
    root,
    base,
    head,
    title,
    authorType,
    labels: labelsValue,
  } = parseArguments(args, path.resolve(__dirname, ".."));
  const labels = labelsValue
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const isReleasePleasePr = isTrustedReleasePleasePullRequest(
    title,
    authorType,
    labels,
  );
  const errors = [];
  if (
    containsUnmaskedCredential(addedDiffText(pluginDiffText(root, base, head)))
  ) {
    errors.push("diff contains an unmasked credential; use ${VAR}");
  }
  try {
    validatePluginDocumentation(
      root,
      changedPluginFiles(root, base, head),
      isReleasePleasePr,
    );
  } catch (error) {
    errors.push(formatError(error));
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  return "Plugin documentation gate passed.";
}

/** @param {string[]} args @param {{log(message: string): void, error(message: string): void}} io */
function run(args = process.argv.slice(2), io = console) {
  try {
    io.log(main(args));
    return 0;
  } catch (error) {
    io.error(formatError(error));
    return 1;
  }
}

/* c8 ignore next 3 -- exercised through child-process integration tests. */
if (require.main === module) {
  process.exitCode = run();
}

module.exports = {
  addedDiffText,
  changedPluginFiles,
  containsUnmaskedCredential,
  main,
  parseArguments,
  pluginDiffText,
  run,
  validatePluginDocumentation,
};
