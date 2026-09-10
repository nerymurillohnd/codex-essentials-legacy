# Block No Verify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-contained Codex skill that recommends, installs only with approval, and maintains a project- or user-scoped Git bypass-blocking hook.

**Architecture:** The marketplace package exposes only `skills/block-no-verify/`; it has no active plugin hook. The skill ships Python, Bash, and hook-configuration templates as assets, then writes and tests those templates only after a later user authorizes a selected installation scope. Repository Vitest tests materialize the templates in a temporary directory and run the supplied maintenance contract.

**Tech Stack:** Codex plugin compatibility manifest, Codex skill metadata, Python 3 standard library, Bash, Vitest, Node.js 24.20.0, Prettier, ESLint, Markdownlint, Ruff, BasedPyright.

**Spec:** `docs/superpowers/specs/2026-09-09-block-no-verify-design.md`

## Global Constraints

- Use `templates/codex-plugin-plugin.json`, `templates/plugin-README-reusable-template.md`, `templates/CHANGELOG-reusable-template.md`, `templates/LICENSE-reusable-template.md`, and `templates/agents-openai.yaml` as the source coverage maps for their matching artifacts.
- Keep all distributable resources within `plugins/block-no-verify/`; do not declare a `hooks` plugin component or create `plugins/block-no-verify/hooks/`.
- The generated hook must be synchronous `PreToolUse` with matcher `^Bash$`, and the installed user retains `/hooks` review and trust control.
- The generated Python hook is stdlib-only and runs through `python3`; the generated Bash test is executable and has `#!/usr/bin/env bash`.
- Invalid JSON or a parser failure must deny; a valid payload without `tool_input.command` must allow.
- Never hand-edit `.agents/plugins/marketplace.json`; regenerate it with `npm run marketplace:build`.
- Do not commit, push, publish, install the generated hook in a real target, or change user-level Codex configuration without separate explicit authorization.

---

## File Structure

```text
plugins/block-no-verify/
├── .codex-plugin/plugin.json                         # Marketplace identity; skills only
├── CHANGELOG.md                                      # Keep a Changelog history
├── LICENSE.md                                        # Repository-standard MIT license
├── README.md                                         # Product contract and installation boundaries
└── skills/block-no-verify/
    ├── SKILL.md                                      # Approval-gated installer workflow
    ├── agents/openai.yaml                            # Discovery metadata
    ├── assets/templates/block-no-verify.py           # Generated PreToolUse handler
    ├── assets/templates/project-hooks.json           # Generated project hook config fragment
    ├── assets/templates/user-hooks.json              # Generated user hook config fragment
    └── assets/templates/test-block-no-verify.sh      # Generated maintenance test
tests/block-no-verify-skill.test.ts                   # End-to-end template materialization test
README.md                                              # Catalog, use case, and keyword links
release-please-config.json                            # New independent component
.release-please-manifest.json                         # Version state matching plugin.json
.agents/plugins/marketplace.json                      # Generated catalog entry
```

### Task 1: Create the failing consumer-level template test

**Files:**

- Create: `tests/block-no-verify-skill.test.ts`
- Test: `tests/block-no-verify-skill.test.ts`

**Interfaces:**

- Consumes: packaged paths under `plugins/block-no-verify/skills/block-no-verify/assets/templates/`.
- Produces: `runTemplateTest(): SpawnSyncReturns<Buffer>` and manifest assertions that later package files must satisfy.

- [ ] **Step 1: Write the failing test for package shape and materialized templates**

```ts
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(() =>
  temporaryRoots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);

describe("block-no-verify skill templates", () => {
  it("ships no active plugin hook and passes its generated maintenance contract", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.hooks).toBeUndefined();
    expect(existsSync(join(pluginRoot, "hooks"))).toBe(false);
    const projectConfig = JSON.parse(
      readFileSync(join(templateRoot, "project-hooks.json"), "utf8"),
    );
    const userConfig = JSON.parse(
      readFileSync(join(templateRoot, "user-hooks.json"), "utf8"),
    );
    expect(projectConfig.hooks.PreToolUse[0].matcher).toBe("^Bash$");
    expect(userConfig.hooks.PreToolUse[0].hooks[0].command).toContain(
      "${HOME}/.codex/hooks/block-no-verify.py",
    );
    const root = materializeTemplates();
    const result = runTemplateTest(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain("PASS");
  });
});
```

- [ ] **Step 2: Run the focused test and verify the expected missing-template failure**

Run: `zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'`

Expected: FAIL because `plugins/block-no-verify/.codex-plugin/plugin.json` and template assets do not yet exist.

### Task 2: Implement the self-contained generated hook and maintenance test

**Files:**

- Create: `plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py`
- Create: `plugins/block-no-verify/skills/block-no-verify/assets/templates/project-hooks.json`
- Create: `plugins/block-no-verify/skills/block-no-verify/assets/templates/user-hooks.json`
- Create: `plugins/block-no-verify/skills/block-no-verify/assets/templates/test-block-no-verify.sh`
- Test: `tests/block-no-verify-skill.test.ts`

**Interfaces:**

- Consumes: Codex `PreToolUse` JSON with optional `tool_input.command`.
- Produces: empty stdout for allowed calls, or `hookSpecificOutput.permissionDecision: "deny"` JSON for blocked or unparsable calls.
- Produces: an executable Bash test that emits `PASS` only when all supplied assertions hold.

- [ ] **Step 1: Implement the Python template with these public interfaces**

`deny(reason: str) -> NoReturn` emits the structured Codex denial and exits;
`split_subcommands(command: str) -> list[str]` separates top-level shell
commands; `lex_words(command: str) -> list[str]` returns unquoted literal
words; `strip_prefix(words: list[str]) -> list[str]` removes supported wrappers;
`is_falsy_gpgsign(value: str) -> bool` checks the four Git boolean spellings;
`check_command(command: str) -> None` denies matching bypasses; and
`main() -> int` parses stdin and routes failures through `deny`.

`split_subcommands` must split `&&`, `||`, `;`, `|`, and newlines only outside quotes and escaped spans; an unmatched quote or escape is an error. `lex_words` must unquote ordinary shell words without evaluating variables, aliases, command substitutions, or scripts. `strip_prefix` must remove leading `NAME=value` assignments and the wrapper forms tested by the Bash contract: `sudo`, `env`, `nice`, `nohup`, `timeout`, `xargs`, `command`, `builtin`, `noglob`, and `watch`.

After prefix stripping, examine only invocations whose executable basename equals `git`, case-insensitively. Reject `--no-verify` and `--no-gpg-sign` unless the token is consumed as the value of `-m` or `--message`. Reject `-c VALUE`, `-cVALUE`, `--config VALUE`, and `--config=VALUE` when `VALUE` is `commit.gpgsign=false|no|off|0`, case-insensitively. Return the documented structured Codex deny JSON with exit status `0`; malformed JSON and lexer errors call `deny`, while `{}` or a payload without a string command exits `0` with no stdout.

- [ ] **Step 2: Add scope-specific generated hook configuration templates**

```json
{
  "description": "Block Git verification and signing bypass flags.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/block-no-verify.py\"",
            "timeout": 10,
            "statusMessage": "Checking Git verification policy"
          }
        ]
      }
    ]
  }
}
```

Save that project configuration as `project-hooks.json`. Create `user-hooks.json`
with the identical event, matcher, timeout, and status text, but make its command
`python3 \"${HOME}/.codex/hooks/block-no-verify.py\"`. The skill selects the
matching asset only after the user chooses scope, and merges the selected
`PreToolUse` group with existing configuration rather than replacing it.

- [ ] **Step 3: Add the supplied Bash contract as `test-block-no-verify.sh`**

Preserve its seven assertion groups and its `verdict`, `want`, and `json_verdict` behavior. Keep its `HOOK` resolution relative to the generated test directory, retain `set -uo pipefail`, and run the generated hook through `python3`. Do not add `set -e`: the test must continue through every assertion and report all failures.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'`

Expected: PASS; the temporary Bash script reports `PASS` after all direct, wrapper, chained, case-insensitive, falsy-config, ordinary-command, corrupt-JSON, and command-absent cases.

- [ ] **Step 5: Run Python formatting, linting, typing, and parse checks**

Run:

```sh
ruff format plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py
ruff check plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py
basedpyright plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py
python3 -c 'from pathlib import Path; compile(Path("plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py").read_text(), "block-no-verify.py", "exec")'
shfmt -w plugins/block-no-verify/skills/block-no-verify/assets/templates/test-block-no-verify.sh
shellcheck plugins/block-no-verify/skills/block-no-verify/assets/templates/test-block-no-verify.sh
```

Expected: every command exits `0`.

### Task 3: Package the approval-gated skill and product documentation

**Files:**

- Create: `plugins/block-no-verify/.codex-plugin/plugin.json`
- Create: `plugins/block-no-verify/skills/block-no-verify/SKILL.md`
- Create: `plugins/block-no-verify/skills/block-no-verify/agents/openai.yaml`
- Create: `plugins/block-no-verify/skills/block-no-verify/references/installation.md`
- Create: `plugins/block-no-verify/README.md`
- Create: `plugins/block-no-verify/CHANGELOG.md`
- Create: `plugins/block-no-verify/LICENSE.md`
- Test: `tests/block-no-verify-skill.test.ts`

**Interfaces:**

- Consumes: the four packaged templates and a later user request to install the guard.
- Produces: a bounded recommendation, then an approval- and scope-gated installation workflow.

- [ ] **Step 1: Extend the failing test with product-contract assertions**

```ts
it("keeps installation behavior in the skill instead of an active plugin hook", () => {
  const skill = readFileSync(
    join(pluginRoot, "skills", "block-no-verify", "SKILL.md"),
    "utf8",
  );
  const readme = readFileSync(join(pluginRoot, "README.md"), "utf8");
  expect(skill).toContain("explicit approval");
  expect(skill).toContain("project or user scope");
  expect(readme).toContain("does not install or enable a hook automatically");
});
```

- [ ] **Step 2: Run the focused test and verify the expected missing-document failure**

Run: `zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'`

Expected: FAIL because the skill and README have not been created.

- [ ] **Step 3: Create the manifest and agent metadata from their templates**

Set manifest `name` to `block-no-verify`, `version` to `0.1.0`, `skills` to `./skills/`, and omit `hooks`, `apps`, and `mcpServers`. Use category `Security`; make its capability copy state that it recommends and creates an approval-gated Git verification policy rather than enforcing one on install. Set `policy.allow_implicit_invocation: true` in `agents/openai.yaml` so Codex can discover the skill for commit-verification and hook-policy work.

- [ ] **Step 4: Write the skill and its focused installation reference**

The skill must recommend the guard once for commit, signing, verification-bypass, or hook-policy requests, but not for ordinary read-only Git usage. Its `references/installation.md` must route the selected project or user scope to the matching configuration asset. The skill must require explicit installation approval, then ask project versus user scope, inspect every active hook source, preserve unrelated hook groups, copy the assets to the selected location, apply executable mode to `test-block-no-verify.sh`, run the test, and direct the user to `/hooks` for review/trust. It must state that a plugin install alone does not alter target configuration and that variable indirection, aliases, `eval`, and opaque scripts remain outside static command inspection.

- [ ] **Step 5: Write package README, changelog, and license from their templates**

The README must document all required repository sections, asset paths, Python/Bash requirements, zero credentials/network use, no automatic hook installation, generated-file permissions and side effects, user-controlled trust, rollback, the focused repository test, and the static-analysis limitations. Add a non-empty `Unreleased` section that describes the new approval-gated skill and templates. Copy the repository MIT license notice with the same verified copyright holder and year convention used by existing plugin licenses.

- [ ] **Step 6: Run skill, package, and focused behavioral checks**

Run:

```sh
uv run --with pyyaml --no-project python3 /Users/nerymurillohnd/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/block-no-verify/skills/block-no-verify
zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'
zsh -ic 'nvm use && npm run validate:plugins'
```

Expected: every command exits `0`.

### Task 4: Register the complete product in repository discovery and release metadata

**Files:**

- Modify: `README.md`
- Modify: `release-please-config.json`
- Modify: `.release-please-manifest.json`
- Modify: `.agents/plugins/marketplace.json` (generated only)
- Modify: `tests/marketplace-pipeline.test.ts`

**Interfaces:**

- Consumes: the authored `block-no-verify` manifest and package README.
- Produces: root discovery links, independent release metadata, and the generated marketplace entry.

- [ ] **Step 1: Extend focused and pipeline tests for repository registration**

```ts
it("registers the skill package in release and repository discovery metadata", () => {
  const rootReadme = readFileSync(join(repositoryRoot, "README.md"), "utf8");
  const releaseConfig = JSON.parse(
    readFileSync(join(repositoryRoot, "release-please-config.json"), "utf8"),
  ) as { packages: Record<string, { component: string }> };
  const releaseState = JSON.parse(
    readFileSync(join(repositoryRoot, ".release-please-manifest.json"), "utf8"),
  ) as Record<string, string>;
  expect(rootReadme).toContain("plugins/block-no-verify/README.md");
  expect(releaseConfig.packages["plugins/block-no-verify"]?.component).toBe(
    "plugin/block-no-verify",
  );
  expect(releaseState["plugins/block-no-verify"]).toBe("0.1.0");
});
```

- [ ] **Step 2: Run the focused test and verify the expected missing-registration failure**

Run: `zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'`

Expected: FAIL because root discovery and Release Please metadata do not yet contain `block-no-verify`.

Also update the pipeline fixture expectation from 12 to 13 manifests and add the
generated `block-no-verify` marketplace entry with its `Security` category. This
keeps the repository-level catalog fixture synchronized with the new package.

- [ ] **Step 3: Update root discovery and Release Please metadata**

Add an alphabetically placed `Block No Verify` row to the root plugin catalog, its matching row in `Choose by use case`, and a `Git verification policy` keyword link. Add `plugins/block-no-verify` to `release-please-config.json` with `package-name: "block-no-verify"`, `component: "plugin/block-no-verify"`, `initial-version: "0.1.0"`, `changelog-path: "CHANGELOG.md"`, and the standard `.codex-plugin/plugin.json` version `extra-files` entry. Add `"plugins/block-no-verify": "0.1.0"` to `.release-please-manifest.json` in lexical order.

- [ ] **Step 4: Generate the catalog from the manifest and run the focused test**

Run:

```sh
zsh -ic 'nvm use && npm run marketplace:build'
zsh -ic 'nvm use && npx vitest run tests/block-no-verify-skill.test.ts'
```

Expected: the generator adds exactly one `block-no-verify` marketplace entry with `source.path` `./plugins/block-no-verify`; the test passes.

### Task 5: Perform complete verification and hand off without a commit

**Files:**

- Verify: all files from Tasks 1–4

- [ ] **Step 1: Run documentation, marketplace, and repository gates at the pinned Node version**

Run:

```sh
zsh -ic 'nvm use && npm run documentation:gate -- --base "$(git merge-base origin/main HEAD)" --head HEAD'
zsh -ic 'nvm use && npm run marketplace:check'
zsh -ic 'nvm use && npm run check'
git diff --check
git status --short
```

Expected: every command exits `0`; report any pre-existing or unrelated gate failure distinctly rather than weakening controls.

- [ ] **Step 2: Inspect package and generated catalog consistency**

Run:

```sh
node -e 'const fs=require("node:fs"); const m=JSON.parse(fs.readFileSync("plugins/block-no-verify/.codex-plugin/plugin.json")); const c=JSON.parse(fs.readFileSync(".agents/plugins/marketplace.json")); const e=c.plugins.find((p)=>p.name===m.name); if (!e || e.source.path!=="./plugins/block-no-verify") process.exit(1);'
git diff -- plugins/block-no-verify README.md release-please-config.json .release-please-manifest.json .agents/plugins/marketplace.json tests/block-no-verify-skill.test.ts docs/superpowers/
```

Expected: exactly the approved package, documentation, catalog, release metadata, test, spec, and plan changes appear; no target repository hook or user-level Codex configuration has been changed.

## Plan Self-Review

- Spec coverage: Tasks 1–2 implement and prove the generated hook and maintenance contract; Task 3 provides the approval-gated skill and template-derived package documents; Task 4 adds catalog, release, and root README discovery; Task 5 runs every required gate and confirms scope preservation.
- Placeholder scan: no deferred implementation steps or unspecified files remain.
- Interface consistency: Task 1's materialized filenames match Tasks 2–3; `block-no-verify` and version `0.1.0` match Tasks 3–4; the project configuration and skill both use `.codex/hooks/block-no-verify.py`, while the user configuration uses `${HOME}/.codex/hooks/block-no-verify.py`.
