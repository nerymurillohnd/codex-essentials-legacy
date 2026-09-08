#!/usr/bin/env node
// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020").default;
const YAML = require("yaml");
const { formatError } = require("./error-utils.cjs");

const MARKETPLACE = Object.freeze({
  name: "codex-essentials",
  displayName: "Codex Essentials",
  installation: "AVAILABLE",
  authentication: "ON_INSTALL",
});
const PLUGINS_DIRECTORY = "plugins";
const PLUGIN_MANIFEST = path.join(".codex-plugin", "plugin.json");
const MARKETPLACE_OUTPUT = path.join(".agents", "plugins", "marketplace.json");
const PLUGIN_SCHEMA = path.join("schemas", "plugin.schema.json");
const MARKETPLACE_SCHEMA = path.join("schemas", "marketplace.schema.json");
const PLUGIN_TEMPLATE = path.join("templates", "codex-plugin-plugin.json");
const AGENT_SCHEMA = path.join("schemas", "agent.schema.json");
const HOOK_SCHEMA = path.join("schemas", "hooks.schema.json");
const ALLOWED_PLUGIN_DIRECTORY_FILES = new Set(["AGENTS.md"]);
const TEMPLATE_FIXED_PATHS = [
  ["author", "name"],
  ["author", "email"],
  ["author", "url"],
  ["homepage"],
  ["repository"],
  ["license"],
  ["interface", "developerName"],
  ["interface", "websiteURL"],
  ["interface", "privacyPolicyURL"],
  ["interface", "termsOfServiceURL"],
];
const FUNCTIONAL_COMPONENT_FIELDS = ["skills", "hooks", "mcpServers", "apps"];
const REQUIRED_PLUGIN_DOCUMENTS = ["README.md", "CHANGELOG.md"];
const README_REQUIRED_SECTIONS = [
  "Purpose",
  "Included Components",
  "Supported Environments",
  "Inputs and Outputs",
  "Required Tools and Credentials",
  "Permissions",
  "Side Effects",
  "Human Approval Boundaries",
  "Installation Behavior",
  "Uninstall and Rollback Behavior",
  "Verification",
  "Known Limitations",
  "Failure and Recovery",
];

/** @param {string} root @param {{allowEmptyUnreleased?: boolean}} [options] */
function loadPluginManifests(root, options = {}) {
  const pluginsRoot = path.join(root, PLUGINS_DIRECTORY);
  assertDirectory(pluginsRoot, "plugins directory");
  const pluginSchema = loadJson(
    path.join(root, PLUGIN_SCHEMA),
    "plugin manifest schema",
  );
  const template = loadTemplateProfile(root);
  const agentSchema = loadJson(
    path.join(root, AGENT_SCHEMA),
    "skill agent schema",
  );
  const hooksSchema = loadJson(
    path.join(root, HOOK_SCHEMA),
    "plugin hooks schema",
  );
  const pluginDirectories = fs
    .readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .filter((entry) => {
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        return true;
      }
      if (ALLOWED_PLUGIN_DIRECTORY_FILES.has(entry.name) && entry.isFile()) {
        return false;
      }
      throw new Error(`plugins/${entry.name} must be a real plugin directory`);
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  if (pluginDirectories.length === 0) {
    throw new Error("plugins directory must contain at least one plugin");
  }
  return pluginDirectories.map((entry) => {
    const pluginRoot = path.join(pluginsRoot, entry.name);
    assertDirectory(pluginRoot, `plugins/${entry.name}`);
    assertContained(pluginsRoot, pluginRoot, `plugins/${entry.name}`);
    assertNoSymlinks(pluginRoot);
    validatePluginDocumentation(
      pluginRoot,
      `plugins/${entry.name}`,
      options.allowEmptyUnreleased === true,
    );
    const manifestPath = path.join(pluginRoot, PLUGIN_MANIFEST);
    assertRegularFile(manifestPath, `plugins/${entry.name}/${PLUGIN_MANIFEST}`);
    assertContained(pluginRoot, manifestPath, manifestPath);
    const manifest = loadJson(manifestPath, "plugin manifest");
    const record = asRecord(manifest, manifestPath);
    assertFunctionalComponent(record, manifestPath);
    validate(pluginSchema, manifest, manifestPath);
    validateFixedTemplateFields(record, template, manifestPath);
    if (record.name !== entry.name) {
      throw new Error(`${manifestPath} name must match plugins/${entry.name}`);
    }
    validatePluginResources(pluginRoot, record, agentSchema, hooksSchema);
    return { name: entry.name, pluginRoot, manifest: record };
  });
}

/** @param {string} root @param {Array<{name: string, manifest: Record<string, unknown>}>} plugins */
function buildMarketplace(root, plugins) {
  if (path.resolve(root) !== fs.realpathSync(root)) {
    throw new Error("repository root must not be a symbolic link");
  }
  return {
    name: MARKETPLACE.name,
    interface: { displayName: MARKETPLACE.displayName },
    plugins: plugins.map(({ name, manifest }) => {
      const interfaceValue = asRecord(
        manifest.interface,
        `plugins/${name}/.codex-plugin/plugin.json interface`,
      );
      return {
        name,
        source: { source: "local", path: `./plugins/${name}` },
        policy: {
          installation: MARKETPLACE.installation,
          authentication: MARKETPLACE.authentication,
        },
        category: interfaceValue.category,
      };
    }),
  };
}

/** @param {string} root @param {unknown} marketplace */
function validateMarketplace(root, marketplace) {
  const schema = loadJson(
    path.join(root, MARKETPLACE_SCHEMA),
    "marketplace schema",
  );
  validate(schema, marketplace, path.join(root, MARKETPLACE_OUTPUT));
  assertUniqueMarketplacePluginNames(marketplace);
}

/** @param {unknown} marketplace */
function assertUniqueMarketplacePluginNames(marketplace) {
  const catalog = asRecord(marketplace, "marketplace catalog");
  const entries = /** @type {unknown[]} */ (catalog.plugins);
  const names = new Set();
  for (const entry of entries) {
    const name = asRecord(entry, "marketplace plugin entry").name;
    if (typeof name !== "string") {
      throw new Error("marketplace plugin entry name must be a string");
    }
    if (names.has(name)) {
      throw new Error(`marketplace plugin name must be unique: ${name}`);
    }
    names.add(name);
  }
}

/** @param {string} root */
function loadMarketplace(root) {
  const outputPath = path.join(root, MARKETPLACE_OUTPUT);
  assertRegularFile(outputPath, MARKETPLACE_OUTPUT);
  assertContained(root, outputPath, MARKETPLACE_OUTPUT);
  const marketplace = loadJson(outputPath, "marketplace catalog");
  validateMarketplace(root, marketplace);
  return asRecord(marketplace, outputPath);
}

/** @param {string} root @param {unknown} marketplace */
function writeMarketplace(root, marketplace) {
  validateMarketplace(root, marketplace);
  const agentsDirectory = path.join(root, ".agents");
  const pluginsDirectory = path.join(agentsDirectory, "plugins");
  fs.mkdirSync(pluginsDirectory, { recursive: true });
  assertDirectory(agentsDirectory, ".agents");
  assertDirectory(pluginsDirectory, ".agents/plugins");
  assertContained(root, pluginsDirectory, ".agents/plugins");
  const outputPath = path.join(root, MARKETPLACE_OUTPUT);
  if (fs.existsSync(outputPath) && fs.lstatSync(outputPath).isSymbolicLink()) {
    throw new Error(`${MARKETPLACE_OUTPUT} must not be a symbolic link`);
  }
  const temporaryPath = `${outputPath}.tmp`;
  if (fs.existsSync(temporaryPath)) {
    throw new Error(`${MARKETPLACE_OUTPUT}.tmp already exists`);
  }
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(marketplace, null, 2)}\n`,
    "utf8",
  );
  fs.renameSync(temporaryPath, outputPath);
  assertRegularFile(outputPath, MARKETPLACE_OUTPUT);
  assertContained(root, outputPath, MARKETPLACE_OUTPUT);
}

/** @param {string} pluginRoot @param {Record<string, unknown>} manifest @param {unknown} agentSchema @param {unknown} hooksSchema */
function validatePluginResources(
  pluginRoot,
  manifest,
  agentSchema,
  hooksSchema,
) {
  validateDeclaredComponents(pluginRoot, manifest);
  if (typeof manifest.skills === "string") {
    const skillsRoot = resolvePluginPath(pluginRoot, manifest.skills, "skills");
    assertDirectory(skillsRoot, `${manifest.skills}`);
    assertSkillDirectory(skillsRoot, manifest.skills, agentSchema);
  }
  if (typeof manifest.mcpServers === "string") {
    const target = resolvePluginPath(
      pluginRoot,
      manifest.mcpServers,
      "mcpServers",
    );
    assertRegularFile(target, manifest.mcpServers);
    validateReferencedMcpConfiguration(
      loadJson(target, "plugin MCP configuration"),
      target,
    );
  }
  if (typeof manifest.apps === "string") {
    const target = resolvePluginPath(pluginRoot, manifest.apps, "apps");
    assertRegularFile(target, manifest.apps);
  }
  for (const hookPath of hookPaths(manifest.hooks)) {
    const target = resolvePluginPath(pluginRoot, hookPath, "hooks");
    assertRegularFile(target, hookPath);
    const hookConfiguration = loadJson(target, "plugin hooks configuration");
    validate(hooksSchema, hookConfiguration, target);
  }
  const interfaceValue = asRecord(manifest.interface, "plugin interface");
  for (const field of ["composerIcon", "logo"]) {
    const value = interfaceValue[field];
    if (typeof value === "string") {
      assertRegularFile(resolvePluginPath(pluginRoot, value, field), value);
    }
  }
  if (Array.isArray(interfaceValue.screenshots)) {
    for (const screenshot of interfaceValue.screenshots) {
      if (typeof screenshot !== "string") {
        throw new Error("interface.screenshots must contain only paths");
      }
      assertRegularFile(
        resolvePluginPath(pluginRoot, screenshot, "screenshots"),
        screenshot,
      );
    }
  }
}

/** @param {unknown} configuration @param {string} label */
function validateReferencedMcpConfiguration(configuration, label) {
  const record = asRecord(configuration, label);
  const wrappedServers = record.mcpServers ?? record.mcp_servers;
  if (wrappedServers !== undefined) {
    if (Object.keys(record).length !== 1) {
      throw new Error(
        `${label} wrapped configuration must contain exactly one top-level key`,
      );
    }
    validateMcpServerMap(wrappedServers, `${label} MCP servers`);
    return;
  }
  validateMcpServerMap(record, `${label} MCP server map`);
}

/** @param {unknown} value @param {string} label */
function validateMcpServerMap(value, label) {
  const servers = asRecord(value, label);
  const entries = Object.entries(servers);
  if (entries.length === 0) {
    throw new Error(`${label} must contain at least one server`);
  }
  for (const [name, serverValue] of entries) {
    if (!/^[A-Za-z0-9_-]+$/u.test(name)) {
      throw new Error(`${label} server name is invalid: ${name}`);
    }
    validateMcpServer(serverValue, `${label}.${name}`);
  }
}

/** @param {unknown} value @param {string} label */
function validateMcpServer(value, label) {
  const server = asRecord(value, label);
  const serverFields = Object.keys(server);
  for (const field of serverFields) {
    if (!isSupportedMcpServerField(server, field)) {
      throw new Error(`${label}.${field} is not a supported MCP server field`);
    }
  }
  const hasCommand = isNonEmptyString(server.command);
  const hasUrl = isNonEmptyString(server.url);
  if (hasCommand === hasUrl) {
    throw new Error(`${label} must define exactly one of command or url`);
  }
  if (
    server.args !== undefined &&
    (!Array.isArray(server.args) ||
      !server.args.every((entry) => typeof entry === "string"))
  ) {
    throw new Error(`${label}.args must be an array of strings`);
  }
  if (server.env !== undefined) {
    const env = asRecord(server.env, `${label}.env`);
    if (Object.keys(env).length === 0) {
      throw new Error(`${label}.env must not be empty`);
    }
    for (const [key, envValue] of Object.entries(env)) {
      if (key.length === 0 || typeof envValue !== "string") {
        throw new Error(`${label}.env must map non-empty keys to strings`);
      }
    }
  }
  if (
    server.url !== undefined &&
    !/^https:\/\/[^\s]+$/u.test(String(server.url))
  ) {
    throw new Error(`${label}.url must be an https URL`);
  }
}

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/** @param {Record<string, unknown>} manifest @param {string} label */
function assertFunctionalComponent(manifest, label) {
  if (
    !FUNCTIONAL_COMPONENT_FIELDS.some((field) => manifest[field] !== undefined)
  ) {
    throw new Error(
      `${label} must declare at least one functional component: ${FUNCTIONAL_COMPONENT_FIELDS.join(", ")}`,
    );
  }
}

/** @param {string} pluginRoot @param {string} label @param {boolean} [allowEmptyUnreleased] */
function validatePluginDocumentation(
  pluginRoot,
  label,
  allowEmptyUnreleased = false,
) {
  for (const document of REQUIRED_PLUGIN_DOCUMENTS) {
    const documentPath = path.join(pluginRoot, document);
    assertRegularFile(documentPath, `${label}/${document}`);
    const content = fs.readFileSync(documentPath, "utf8");
    if (content.trim().length === 0) {
      throw new Error(`${label}/${document} must not be empty`);
    }
    if (document === "README.md") {
      const missing = missingReadmeSections(content);
      if (missing.length > 0) {
        throw new Error(
          missing
            .map(
              (section) =>
                `${label}/README.md is missing required section: ${section}`,
            )
            .join("\n"),
        );
      }
    }
    if (
      document === "CHANGELOG.md" &&
      !allowEmptyUnreleased &&
      !/^## \[Unreleased\]\s*$/mu.test(content)
    ) {
      throw new Error(
        `${label}/CHANGELOG.md must contain an Unreleased section`,
      );
    }
  }
}

/** @param {string} content */
function missingReadmeSections(content) {
  const headings = content
    .split(/\r?\n/u)
    .filter((line) => line.startsWith("## "));
  return README_REQUIRED_SECTIONS.filter(
    (section) => !headings.some((heading) => heading.includes(section)),
  );
}

/** @param {string} pluginRoot @param {Record<string, unknown>} manifest */
function validateDeclaredComponents(pluginRoot, manifest) {
  const conventionalComponents = [
    ["skills", "skills"],
    ["mcpServers", ".mcp.json"],
    ["apps", ".app.json"],
    ["hooks", "hooks"],
  ];
  for (const [field, relativePath] of conventionalComponents) {
    const componentPath = path.join(pluginRoot, relativePath);
    if (fs.existsSync(componentPath) && manifest[field] === undefined) {
      throw new Error(
        `${field} must declare the existing ./${relativePath} component`,
      );
    }
    if (
      !fs.existsSync(componentPath) &&
      manifest[field] !== undefined &&
      field === "skills"
    ) {
      throw new Error(`${manifest[field]} is missing`);
    }
  }
}

/** @param {string} skillsRoot @param {string} label */
function assertSkillDirectory(skillsRoot, label, agentSchema) {
  const skillEntries = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."));
  if (skillEntries.length === 0) {
    throw new Error(`${label} must contain at least one skill directory`);
  }
  for (const entry of skillEntries) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error(`${label}/${entry.name} must be a real directory`);
    }
    const skillRoot = path.join(skillsRoot, entry.name);
    assertContained(skillsRoot, skillRoot, `${label}/${entry.name}`);
    assertRegularFile(
      path.join(skillRoot, "SKILL.md"),
      `${label}/${entry.name}/SKILL.md`,
    );
    const agentPath = path.join(skillRoot, "agents", "openai.yaml");
    assertRegularFile(agentPath, `${label}/${entry.name}/agents/openai.yaml`);
    const agent = loadYaml(agentPath, "skill agent manifest");
    validate(agentSchema, agent, agentPath);
    const agentInterface = asRecord(
      asRecord(agent, agentPath).interface,
      agentPath,
    );
    for (const field of ["icon_small", "icon_large"]) {
      if (typeof agentInterface[field] === "string") {
        assertRegularFile(
          resolvePluginPath(skillRoot, agentInterface[field], field),
          agentInterface[field],
        );
      }
    }
  }
}

/** @param {string} root */
function assertNoSymlinks(root) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`${target} must not be a symbolic link`);
    }
    if (entry.isDirectory()) {
      assertNoSymlinks(target);
    }
  }
}

/** @param {unknown} hooks */
function hookPaths(hooks) {
  if (typeof hooks === "string") {
    return [hooks];
  }
  if (
    !Array.isArray(hooks) ||
    hooks.length === 0 ||
    typeof hooks[0] !== "string"
  ) {
    return [];
  }
  if (!hooks.every((entry) => typeof entry === "string")) {
    throw new Error("hooks path array must contain only paths");
  }
  return hooks;
}

/** @param {string} pluginRoot @param {string} relativePath @param {string} field */
function resolvePluginPath(pluginRoot, relativePath, field) {
  if (
    !relativePath.startsWith("./") ||
    relativePath.split(/[\\/]+/u).includes("..")
  ) {
    throw new Error(
      `${field} path must start with ./ and remain inside the plugin root`,
    );
  }
  const target = path.resolve(pluginRoot, relativePath);
  const relativeTarget = path.relative(pluginRoot, target);
  if (
    relativeTarget === "" ||
    relativeTarget.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeTarget)
  ) {
    throw new Error(`${field} path resolves outside the plugin root`);
  }
  return target;
}

/** @param {string} root */
function loadTemplateProfile(root) {
  const templatePath = path.join(root, PLUGIN_TEMPLATE);
  const rawTemplate = fs.readFileSync(templatePath, "utf8");
  const rendered = rawTemplate.replace(/\{\{[A-Z_]+\}\}/gu, "placeholder");
  return asRecord(JSON.parse(rendered), templatePath);
}

/** @param {Record<string, unknown>} manifest @param {Record<string, unknown>} template @param {string} label */
function validateFixedTemplateFields(manifest, template, label) {
  for (const fieldPath of TEMPLATE_FIXED_PATHS) {
    const actual = getField(manifest, fieldPath, label);
    const expected = getField(template, fieldPath, "template");
    if (actual !== expected) {
      throw new Error(
        `${label} ${fieldPath.join(".")} must equal the fixed template value`,
      );
    }
  }
}

/** @param {Record<string, unknown>} value @param {string[]} fieldPath @param {string} label */
function getField(value, fieldPath, label) {
  let current = /** @type {unknown} */ (value);
  for (const segment of fieldPath) {
    current = asRecord(current, label)[segment];
  }
  return current;
}

/** @param {string[]} args @param {string} defaultRoot */
function resolveRootFromArgs(args, defaultRoot) {
  if (args.length === 0) {
    return defaultRoot;
  }
  if (args.length !== 2 || args[0] !== "--root" || args[1] === undefined) {
    throw new Error("usage: --root <repository-root>");
  }
  return path.resolve(args[1]);
}

/** @param {string} root @param {string} target @param {string} label */
function assertContained(root, target, label) {
  const resolvedRoot = fs.realpathSync(root);
  const resolvedTarget = fs.realpathSync(target);
  if (
    resolvedTarget !== resolvedRoot &&
    !resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error(`${label} resolves outside its allowed root`);
  }
}

/** @param {string} target @param {string} label */
function assertRegularFile(target, label) {
  let metadata;
  try {
    metadata = fs.lstatSync(target);
  } catch {
    throw new Error(`${label} is missing`);
  }
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

/** @param {string} target @param {string} label */
function assertDirectory(target, label) {
  let metadata;
  try {
    metadata = fs.lstatSync(target);
  } catch {
    throw new Error(`${label} is missing`);
  }
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error(`${label} must be a real directory`);
  }
}

/** @param {string} target @param {string} label */
function loadJson(target, label) {
  try {
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch (error) {
    throw new Error(
      `unable to load ${label} at ${target}: ${formatError(error)}`,
    );
  }
}

/** @param {string} target @param {string} label */
function loadYaml(target, label) {
  try {
    return YAML.parse(fs.readFileSync(target, "utf8"));
  } catch (error) {
    throw new Error(
      `unable to load ${label} at ${target}: ${formatError(error)}`,
    );
  }
}

/** @param {unknown} schema @param {unknown} payload @param {string} label */
function validate(schema, payload, label) {
  const validator = new Ajv2020({ allErrors: true, strict: true }).compile(
    /** @type {import("ajv").AnySchema} */ (schema),
  );
  if (validator(payload)) {
    return;
  }
  const details = (validator.errors || [])
    .map((error) => `${error.instancePath || "$"} ${error.message}`)
    .join("; ");
  throw new Error(`${label} is invalid: ${details}`);
}

/** @param {unknown} value @param {string} label */
function asRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return /** @type {Record<string, unknown>} */ (value);
}

/** @param {Record<string, unknown>} server @param {string} field */
function isSupportedMcpServerField(server, field) {
  const baseFields = new Set(["command", "args", "env", "url"]);
  return (
    baseFields.has(field) ||
    (field === "type" && server.type === "http" && isNonEmptyString(server.url))
  );
}

module.exports = {
  MARKETPLACE,
  MARKETPLACE_OUTPUT,
  assertContained,
  assertDirectory,
  assertFunctionalComponent,
  assertNoSymlinks,
  assertRegularFile,
  assertSkillDirectory,
  assertUniqueMarketplacePluginNames,
  asRecord,
  buildMarketplace,
  getField,
  hookPaths,
  loadJson,
  loadMarketplace,
  loadPluginManifests,
  loadTemplateProfile,
  loadYaml,
  missingReadmeSections,
  resolveRootFromArgs,
  resolvePluginPath,
  validate,
  validateDeclaredComponents,
  validateFixedTemplateFields,
  validateMcpServer,
  validateMcpServerMap,
  validatePluginDocumentation,
  validateMarketplace,
  validatePluginResources,
  validateReferencedMcpConfiguration,
  writeMarketplace,
};
