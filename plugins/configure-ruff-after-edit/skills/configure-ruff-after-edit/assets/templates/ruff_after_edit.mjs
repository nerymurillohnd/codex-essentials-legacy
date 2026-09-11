// @ts-check

import { spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  lstatSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { delimiter, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_EVENT_TIMEOUT_MS = 15_000;
const DEFAULT_COMMAND_TIMEOUT_MS = 5_000;
const POSIX_PLATFORMS = new Set([
  "aix",
  "darwin",
  "freebsd",
  "linux",
  "netbsd",
  "openbsd",
]);

/** @typedef {{ cwd?: unknown, hook_event_name?: unknown, tool_input?: unknown, tool_name?: unknown }} HookPayload */
/** @typedef {{ root: string, target: string, relativePath: string }} ContainedFile */
/** @typedef {{ status: number | null, timedOut: boolean }} CommandResult */
/** @typedef {{ platform?: string, eventTimeoutMs?: number, commandTimeoutMs?: number, configPath?: string | null }} HandleOptions */

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** @param {string} rawInput @returns {HookPayload | null} */
export function parsePayload(rawInput) {
  if (!rawInput.trim()) {
    return null;
  }
  const value = JSON.parse(rawInput);
  return isRecord(value) ? value : null;
}

/** @param {unknown} source @returns {string[]} */
function directPathValues(source) {
  if (!isRecord(source)) {
    return [];
  }
  return ["path", "file_path", "filename"].flatMap((key) => {
    const value = source[key];
    return typeof value === "string" ? [value] : [];
  });
}

/** @param {unknown} source @returns {string[]} */
function fileListValues(source) {
  if (!isRecord(source) || !Array.isArray(source.files)) {
    return [];
  }
  return source.files.flatMap((value) =>
    typeof value === "string" ? [value] : directPathValues(value),
  );
}

/** @param {HookPayload} payload @returns {string[]} */
export function collectCandidates(payload) {
  /** @type {string[]} */
  const values = [
    ...directPathValues(payload),
    ...directPathValues(payload.tool_input),
    ...fileListValues(payload),
    ...fileListValues(payload.tool_input),
  ];
  if (payload.tool_name === "apply_patch" && isRecord(payload.tool_input)) {
    const command = payload.tool_input.command;
    if (typeof command === "string") {
      for (const line of command.split(/\r?\n/u)) {
        const match = line.match(/^\*\*\* (?:Add|Update) File: (.+)$/u);
        if (match?.[1]) {
          values.push(match[1]);
        }
      }
    }
  }
  return [...new Set(values.filter(Boolean))];
}

/** @param {string} root @param {string} candidate @returns {boolean} */
function staysWithin(root, candidate) {
  const fromRoot = relative(root, candidate);
  return !(
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    isAbsolute(fromRoot)
  );
}

/** @param {string} root @param {string} candidate @returns {boolean} */
function hasSymlinkComponent(root, candidate) {
  const fromRoot = relative(root, candidate);
  let current = root;
  for (const part of fromRoot.split(sep)) {
    if (!part || part === ".") {
      continue;
    }
    current = join(current, part);
    if (lstatSync(current).isSymbolicLink()) {
      return true;
    }
  }
  return false;
}

/** @param {string} cwd @param {string} candidate @returns {ContainedFile | null} */
export function resolveContainedPythonFile(cwd, candidate) {
  const root = realpathSync(cwd);
  const lexicalTarget = isAbsolute(candidate)
    ? resolve(candidate)
    : resolve(root, candidate);
  if (!staysWithin(root, lexicalTarget) || !lexicalTarget.endsWith(".py")) {
    return null;
  }
  try {
    if (
      hasSymlinkComponent(root, lexicalTarget) ||
      !lstatSync(lexicalTarget).isFile()
    ) {
      return null;
    }
    const target = realpathSync(lexicalTarget);
    if (!staysWithin(root, target) || !statSync(target).isFile()) {
      return null;
    }
    return { root, target, relativePath: relative(root, target) };
  } catch {
    return null;
  }
}

/** @param {string} path @returns {boolean} */
function isExecutable(path) {
  try {
    return statSync(path).isFile() && (accessSync(path, constants.X_OK), true);
  } catch {
    return false;
  }
}

/** @param {string} executable @param {string[]} args @param {string} cwd @param {number} deadline @param {number} commandTimeoutMs @returns {CommandResult} */
export function runCommand(executable, args, cwd, deadline, commandTimeoutMs) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    return { status: null, timedOut: true };
  }
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    timeout: Math.max(1, Math.min(remaining, commandTimeoutMs)),
  });
  return {
    status: result.status,
    timedOut: result.error?.code === "ETIMEDOUT" || Date.now() >= deadline,
  };
}

/** @param {string} root @param {NodeJS.ProcessEnv} env @param {number} deadline @param {number} commandTimeoutMs @returns {string | null} */
export function findRuff(root, env, deadline, commandTimeoutMs) {
  const candidates = [join(root, ".venv", "bin", "ruff")];
  for (const directory of (env.PATH ?? "").split(delimiter).filter(Boolean)) {
    candidates.push(join(directory, "ruff"));
  }
  for (const candidate of candidates) {
    if (!isExecutable(candidate)) {
      continue;
    }
    const result = runCommand(
      candidate,
      ["--version"],
      root,
      deadline,
      commandTimeoutMs,
    );
    if (result.status === 0) {
      return candidate;
    }
  }
  return null;
}

/** @param {string | null | undefined} value @returns {string | null} */
export function canonicalConfigPath(value) {
  if (!value || !isAbsolute(value)) {
    return null;
  }
  try {
    const resolved = resolve(value);
    return lstatSync(resolved).isFile() && realpathSync(resolved) === resolved
      ? resolved
      : null;
  } catch {
    return null;
  }
}

/** @param {string[]} arguments_ @returns {string | null | undefined} */
export function parseConfigArgument(arguments_) {
  if (!arguments_.length) {
    return null;
  }
  return arguments_.length === 2 && arguments_[0] === "--config"
    ? canonicalConfigPath(arguments_[1])
    : undefined;
}

/** @param {string} executable @param {ContainedFile} file @param {string | null} configPath @param {number} deadline @param {number} commandTimeoutMs @returns {string | null} */
function runRuff(executable, file, configPath, deadline, commandTimeoutMs) {
  const config = configPath ? ["--config", configPath] : [];
  const phases = [
    ["check", ...config, "--fix", "--no-unsafe-fixes", file.relativePath],
    ["format", ...config, file.relativePath],
    ["check", ...config, file.relativePath],
  ];
  for (const arguments_ of phases) {
    const result = runCommand(
      executable,
      arguments_,
      file.root,
      deadline,
      commandTimeoutMs,
    );
    if (result.timedOut) {
      return "timed out";
    }
    if (result.status !== 0) {
      return `${arguments_[0]} reported diagnostics`;
    }
  }
  return null;
}

/** @param {string} rawInput @param {NodeJS.ProcessEnv} env @param {HandleOptions} options @returns {string} */
export function handle(rawInput, env = process.env, options = {}) {
  const platform = options.platform ?? process.platform;
  if (!POSIX_PLATFORMS.has(platform)) {
    return "ruff-after-edit: skipped; this template supports POSIX hosts only.";
  }
  let payload;
  try {
    payload = parsePayload(rawInput);
  } catch {
    return "ruff-after-edit: skipped; unable to parse hook payload.";
  }
  if (!payload || payload.hook_event_name !== "PostToolUse") {
    return "ruff-after-edit: skipped; unsupported hook event.";
  }
  if (typeof payload.cwd !== "string") {
    return "ruff-after-edit: skipped; event cwd is unavailable.";
  }
  let root;
  try {
    root = realpathSync(payload.cwd);
    if (!statSync(root).isDirectory()) {
      return "ruff-after-edit: skipped; event cwd is not a directory.";
    }
  } catch {
    return "ruff-after-edit: skipped; event cwd is unavailable.";
  }
  const configPath = canonicalConfigPath(options.configPath);
  if (options.configPath && !configPath) {
    return "ruff-after-edit: skipped; approved Ruff configuration is unavailable.";
  }
  const files = collectCandidates(payload)
    .map((candidate) => resolveContainedPythonFile(root, candidate))
    .filter((file) => file !== null);
  if (!files.length) {
    return "ruff-after-edit: skipped; no eligible reported Python files.";
  }
  const eventTimeoutMs = options.eventTimeoutMs ?? DEFAULT_EVENT_TIMEOUT_MS;
  const commandTimeoutMs =
    options.commandTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
  const deadline = Date.now() + eventTimeoutMs;
  const ruff = findRuff(root, env, deadline, commandTimeoutMs);
  if (!ruff) {
    return "ruff-after-edit: skipped; Ruff is unavailable or the event budget expired.";
  }
  let processed = 0;
  for (const file of files) {
    const failure = runRuff(ruff, file, configPath, deadline, commandTimeoutMs);
    if (failure) {
      return `ruff-after-edit: ${failure}; processed ${processed} file(s).`;
    }
    processed += 1;
  }
  return `ruff-after-edit: processed ${processed} reported Python file(s).`;
}

/** @param {string} systemMessage */
export function emit(systemMessage) {
  process.stdout.write(`${JSON.stringify({ systemMessage })}\n`);
}

/** @param {string} rawInput @param {NodeJS.ProcessEnv} env @param {string[]} arguments_ @returns {number} */
export function main(
  rawInput,
  env = process.env,
  arguments_ = process.argv.slice(2),
) {
  const configPath = parseConfigArgument(arguments_);
  const message =
    configPath === undefined
      ? "ruff-after-edit: skipped; invalid configuration argument."
      : handle(rawInput, env, { configPath });
  emit(message);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main(readFileSync(0, "utf8"));
}
