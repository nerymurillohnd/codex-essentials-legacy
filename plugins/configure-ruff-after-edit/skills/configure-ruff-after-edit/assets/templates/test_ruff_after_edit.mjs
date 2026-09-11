// @ts-check

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  realpathSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const templateDirectory = dirname(fileURLToPath(import.meta.url));
const handler = join(templateDirectory, "ruff_after_edit.mjs");

/** @param {boolean} condition @param {unknown} message */
function assertThat(condition, message) {
  if (!condition) {
    throw new Error(String(message));
  }
}

/** @param {string} directory @param {boolean} unfixable @param {number} delayMs @param {boolean} optionInjection @param {boolean} firstPassDiagnostics */
function writeFakeRuff(
  directory,
  unfixable = false,
  delayMs = 0,
  optionInjection = false,
  firstPassDiagnostics = false,
) {
  const executable = join(directory, "ruff");
  writeFileSync(
    executable,
    `#!${process.execPath}\n` +
      'import { appendFileSync } from "node:fs";\n' +
      "const arguments_ = process.argv.slice(2);\n" +
      'appendFileSync(process.env.RUFF_LOG, `${arguments_.join(" ")}\\n`);\n' +
      `if (${delayMs} > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ${delayMs});\n` +
      'if (arguments_.length === 1 && arguments_[0] === "--version") process.exit(0);\n' +
      `if (${optionInjection} && arguments_.includes("--output-file=report.py") && !arguments_.includes("--")) {\n` +
      '  writeFileSync(join(process.cwd(), "unreported.py"), "changed = true\\n", "utf8");\n' +
      '}\n' +
      `if (${firstPassDiagnostics} && arguments_[0] === "check" && arguments_.includes("--fix")) process.exit(1);\n` +
      `if (${unfixable} && arguments_[0] === "check" && !arguments_.includes("--fix")) process.exit(1);\n`,
    "utf8",
  );
  chmodSync(executable, 0o755);
}

/** @param {string} project @param {Record<string, unknown>} input @param {string[]} arguments_ @param {NodeJS.ProcessEnv} env */
function invoke(project, input, arguments_, env, handlerPath = handler) {
  return spawnSync(process.execPath, [handlerPath, ...arguments_], {
    cwd: project,
    encoding: "utf8",
    env,
    input: JSON.stringify({
      hook_event_name: "PostToolUse",
      cwd: project,
      tool_name: "Write",
      tool_input: input,
    }),
  });
}

/** @param {ReturnType<typeof invoke>} result */
function message(result) {
  assertThat(result.status === 0, result.stderr);
  const lines = result.stdout.trim().split("\n");
  assertThat(lines.length === 1, result.stdout);
  const output = JSON.parse(lines[0]);
  assertThat(typeof output.systemMessage === "string", result.stdout);
  return output.systemMessage;
}

/** @param {string} log */
function logLines(log) {
  try {
    return readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/** @param {string} scenario */
async function runScenario(scenario) {
  const directory = mkdtempSync(join(tmpdir(), "ruff-after-edit-"));
  const project = join(directory, "project");
  const bin = join(directory, "bin");
  const log = join(directory, "ruff.log");
  mkdirSync(project);
  mkdirSync(bin);
  writeFileSync(join(project, "safe.py"), "value = 1\n", "utf8");
  writeFileSync(join(project, "second.py"), "other = 2\n", "utf8");
  writeFileSync(join(project, "--output-file=report.py"), "reported = 3\n", "utf8");
  writeFileSync(join(project, "unreported.py"), "untouched = true\n", "utf8");
  writeFileSync(join(project, "notes.txt"), "notes\n", "utf8");
  writeFileSync(join(directory, "outside.py"), "outside = 3\n", "utf8");
  const env = { ...process.env, PATH: bin, RUFF_LOG: log };
  const consumerHooks = join(project, ".codex", "hooks");
  mkdirSync(consumerHooks, { recursive: true });
  const consumerHandler = join(consumerHooks, "ruff_after_edit.mjs");
  copyFileSync(handler, consumerHandler);
  const consumerConfigLexicalPath = join(project, ".codex", "ruff.toml");
  writeFileSync(consumerConfigLexicalPath, "line-length = 100\n", "utf8");
  const consumerConfig = realpathSync(consumerConfigLexicalPath);

  if (scenario !== "missing-ruff") {
    writeFakeRuff(
      bin,
      scenario === "unfixable",
      scenario === "timeout" ? 100 : 0,
      scenario === "leading-option",
      scenario === "first-pass-diagnostics",
    );
  }

  if (scenario === "safe-order") {
    assertThat(
      message(invoke(project, { path: "safe.py" }, [], env)).includes(
        "processed",
      ),
      "safe order",
    );
    assertThat(
      JSON.stringify(logLines(log)) ===
        JSON.stringify([
          "--version",
          "check --fix --no-unsafe-fixes -- safe.py",
          "format -- safe.py",
          "check -- safe.py",
        ]),
      logLines(log),
    );
  } else if (scenario === "leading-option") {
    const unreported = join(project, "unreported.py");
    const before = readFileSync(unreported, "utf8");
    message(invoke(project, { path: "--output-file=report.py" }, [], env));
    assertThat(readFileSync(unreported, "utf8") === before, "unreported file changed");
    assertThat(
      logLines(log).every((line) => line === "--version" || line.includes(" -- --output-file=report.py")),
      logLines(log),
    );
  } else if (scenario === "first-pass-diagnostics") {
    const output = message(
      invoke(project, { files: ["safe.py", "second.py"] }, [], env),
    );
    assertThat(output.includes("reported diagnostics"), output);
    assertThat(
      JSON.stringify(logLines(log)) ===
        JSON.stringify([
          "--version",
          "check --fix --no-unsafe-fixes -- safe.py",
          "format -- safe.py",
          "check -- safe.py",
          "check --fix --no-unsafe-fixes -- second.py",
          "format -- second.py",
          "check -- second.py",
        ]),
      logLines(log),
    );
  } else if (scenario === "multiple-files") {
    message(
      invoke(project, { files: ["safe.py", "second.py", "safe.py"] }, [], env),
    );
    assertThat(
      logLines(log).filter((line) => line.includes(".py")).length === 6,
      logLines(log),
    );
  } else if (scenario === "apply-patch") {
    message(
      spawnSync(process.execPath, [handler], {
        cwd: project,
        encoding: "utf8",
        env,
        input: JSON.stringify({
          hook_event_name: "PostToolUse",
          cwd: project,
          tool_name: "apply_patch",
          tool_input: {
            command: "*** Add File: safe.py\n*** Update File: second.py\n",
          },
        }),
      }),
    );
    assertThat(
      logLines(log).filter((line) => line.includes(".py")).length === 6,
      logLines(log),
    );
  } else if (scenario === "non-python") {
    assertThat(
      message(invoke(project, { path: "notes.txt" }, [], env)).includes(
        "no eligible",
      ),
      "non-python",
    );
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "outside" || scenario === "relative-escape") {
    const path =
      scenario === "outside" ? join(directory, "outside.py") : "../outside.py";
    message(invoke(project, { path }, [], env));
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "symlink" || scenario === "parent-symlink") {
    if (scenario === "symlink") {
      symlinkSync(join(project, "safe.py"), join(project, "linked.py"));
      message(invoke(project, { path: "linked.py" }, [], env));
    } else {
      mkdirSync(join(project, "real"));
      writeFileSync(join(project, "real", "nested.py"), "nested = 1\n", "utf8");
      symlinkSync(join(project, "real"), join(project, "linked-directory"));
      message(invoke(project, { path: "linked-directory/nested.py" }, [], env));
    }
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "missing-file" || scenario === "python-directory") {
    if (scenario === "python-directory") {
      mkdirSync(join(project, "package.py"));
    }
    message(
      invoke(
        project,
        { path: scenario === "missing-file" ? "missing.py" : "package.py" },
        [],
        env,
      ),
    );
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "uv-lock" || scenario === "uv-only") {
    writeFileSync(join(project, "uv.lock"), "", "utf8");
    if (scenario === "uv-only") {
      writeFileSync(join(bin, "ruff"), "#!/bin/sh\nexit 1\n", "utf8");
      chmodSync(join(bin, "ruff"), 0o755);
    }
    const output = message(invoke(project, { path: "safe.py" }, [], env));
    assertThat(
      scenario === "uv-lock"
        ? output.includes("processed")
        : output.includes("Ruff is unavailable"),
      output,
    );
  } else if (scenario === "missing-ruff") {
    assertThat(
      message(invoke(project, { path: "safe.py" }, [], env)).includes(
        "Ruff is unavailable",
      ),
      "missing ruff",
    );
  } else if (scenario === "unfixable") {
    assertThat(
      message(invoke(project, { path: "safe.py" }, [], env)).includes(
        "reported diagnostics",
      ),
      "unfixable",
    );
    assertThat(logLines(log).at(-1) === "check -- safe.py", logLines(log));
  } else if (scenario === "strict-profile" || scenario === "normal-discovery") {
    message(
      invoke(
        project,
        { path: "safe.py" },
        scenario === "strict-profile" ? ["--config", consumerConfig] : [],
        env,
        scenario === "strict-profile" ? consumerHandler : handler,
      ),
    );
    const commands = logLines(log).filter((line) => line !== "--version");
    assertThat(
      scenario === "strict-profile"
        ? commands.every((line) => line.includes(`--config ${consumerConfig}`))
        : commands.every((line) => !line.includes("--config")),
      commands,
    );
  } else if (scenario === "packaged-config") {
    const output = message(
      invoke(
        project,
        { path: "safe.py" },
        ["--config", realpathSync(join(templateDirectory, "ruff.toml"))],
        env,
      ),
    );
    assertThat(output.includes("invalid configuration argument"), output);
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "canonical-alias") {
    message(invoke(project, { files: ["safe.py", "./safe.py"] }, [], env));
    assertThat(
      logLines(log).filter((line) => line.includes("safe.py")).length === 3,
      logLines(log),
    );
  } else if (scenario === "invalid-cwd") {
    const result = spawnSync(process.execPath, [handler], {
      cwd: project,
      encoding: "utf8",
      env,
      input: JSON.stringify({
        hook_event_name: "PostToolUse",
        cwd: join(project, "safe.py"),
        tool_input: { path: "safe.py" },
      }),
    });
    assertThat(message(result).includes("not a directory"), result.stdout);
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "posix-guard") {
    const module = await import(`${handler}?scenario=${Date.now()}`);
    const output = module.handle(
      JSON.stringify({
        hook_event_name: "PostToolUse",
        cwd: project,
        tool_input: { path: "safe.py" },
      }),
      env,
      { platform: "win32" },
    );
    assertThat(output.includes("POSIX"), output);
    assertThat(logLines(log).length === 0, logLines(log));
  } else if (scenario === "timeout") {
    const module = await import(`${handler}?scenario=${Date.now()}`);
    const output = module.handle(
      JSON.stringify({
        hook_event_name: "PostToolUse",
        cwd: project,
        tool_input: { path: "safe.py" },
      }),
      env,
      { eventTimeoutMs: 20, commandTimeoutMs: 10 },
    );
    assertThat(
      output.includes("timed out") || output.includes("budget expired"),
      output,
    );
  } else if (scenario === "node-unavailable") {
    const command = `if command -v node >/dev/null 2>&1; then node \"${handler}\"; else printf '%s\\n' '{\"systemMessage\":\"ruff-after-edit: skipped; Node.js is unavailable.\"}'; fi`;
    const result = spawnSync("/bin/sh", ["-c", command], {
      encoding: "utf8",
      env: { PATH: "" },
    });
    assertThat(
      JSON.parse(result.stdout).systemMessage.includes(
        "Node.js is unavailable",
      ),
      result.stdout,
    );
  } else {
    throw new Error(`unknown scenario: ${scenario}`);
  }

  console.log(logLines(log).join("\n"));
}

try {
  await runScenario(process.argv[2] ?? "");
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
}
