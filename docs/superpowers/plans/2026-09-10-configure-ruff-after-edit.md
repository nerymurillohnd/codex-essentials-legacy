# Configure Ruff After Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an approval-gated, skills-only marketplace plugin that assesses a Python environment and creates a safe Ruff post-edit hook only when the user explicitly approves it.

**Architecture:** `configure-ruff-after-edit` is self-contained and has no declared lifecycle-hook component. It distributes inert templates and focused references. The skill owns assessment, recommendation, approval, generation, validation, trust, and rollback guidance; the generated Node.js handler owns the exact-file Ruff workflow.

**Tech Stack:** Codex plugin manifest and agent metadata, Markdown, YAML, JSON, Ruff, Node.js 24 templates, TypeScript, Vitest, Prettier, markdownlint, and Release Please.

**Spec:** `docs/superpowers/specs/2026-09-10-configure-ruff-after-edit-design.md`

## Global Constraints

- Plugin ID and skill ID are exactly `configure-ruff-after-edit`.
- Start `plugin.json`, agent metadata, README, changelog, and license from their repository templates; remove unsupported template markers and fields.
- Declare only `"skills": "./skills/"`; never create a package `hooks/` directory or a manifest `hooks` declaration.
- Installation must not write target configuration, install tooling, invoke Ruff, activate a hook, or trust a hook.
- The skill must inspect first and require explicit approval for scope and exact writes.
- Generated handlers must use existing Ruff configuration and executable discovery. Never use `pip`, `uv pip`, `uvx`, network access, `--isolated`, unsafe fixes, globs, whole-repository edits, or generated suppressions.
- Run `ruff check --fix --no-unsafe-fixes`, `ruff format`, then final `ruff check` for each eligible event-reported `.py` file.
- Preserve unrelated hooks and do not create JSON and inline TOML definitions at one selected scope.
- Attribute Astral, official Codex hooks, and PyDevTools; state non-affiliation.
- Generate, never hand-edit, `.agents/plugins/marketplace.json`.
- Do not commit, push, tag, release, publish, create a PR, or alter unrelated work.

## Approved Revision: Configuration Choices and Handler Contract

This revision supersedes the earlier Task 2 implementation details where they
conflict with the approved configuration model or the independent compatibility
review.

- The skill must ask and record three choices before every write: hook scope
  (global, project/repository, or directory-bounded); policy source (bundled
  strict profile, discovered configuration, reviewed adjustment, or Ruff
  defaults); and configuration materialization.
- Add the user's approved strict profile unchanged at
  `skills/configure-ruff-after-edit/assets/templates/ruff.toml`. It is inert
  package content, never a runtime dependency under `PLUGIN_ROOT`.
- A global strict-profile choice copies that profile to `~/.codex/ruff.toml`
  and passes its canonical path through `--config`. A project strict-profile
  choice copies it to `<project-root>/.codex/ruff.toml` and passes that path.
  A project without Ruff configuration may instead receive an approved root
  `ruff.toml` and normal Ruff discovery. Existing/default choices create no
  file and omit `--config`.
- Do not offer `~/.ruff.toml` or `~/.config/ruff/ruff.toml` as automatic Ruff
  global fallbacks. Do not overwrite an existing project Ruff configuration.
- Replace the rejected handler behavior: valid `PostToolUse` output is one JSON
  object with `systemMessage`; `cwd` must be a directory; total handler work
  must fit under the hook timeout; and the handler requires an already
  available Node.js runtime rather than a Python-process security suppression.
- Keep the supplied Ruff profile strict: do not weaken `select`, `ignore`,
  exclusions, complexity limits, or other profile settings. Do not add `noqa`,
  `per-file-ignores`, config exclusions, or any suppression to make templates
  pass. All Python templates must pass that exact profile structurally.

### Revision Task A: Replace the rejected handler and test the configuration matrix

**Files:**

- Modify: `tests/configure-ruff-after-edit-skill.test.ts`
- Remove: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/ruff_after_edit.py`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/ruff_after_edit.mjs`
- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/project-hooks.json`
- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/user-hooks.json`
- Remove: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/test_ruff_after_edit.py`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/test_ruff_after_edit.mjs`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/ruff.toml`

**Interfaces:**

- Consumes: the exact strict profile supplied in the approved design revision.
- Produces: inert consumer templates that select either normal discovery or a
  displayed consumer-owned `--config` path after approval.

- [ ] **Step 1: Write failing contract cases**

Add focused tests that require: the exact bundled `ruff.toml` settings; no
`noqa`/ignore/exclusion escapes; valid JSON `systemMessage` output; rejected
file-valued `cwd`; bounded timeout behavior; POSIX guard; and commands that add
`--config <canonical approved path>` only in strict-profile mode.

- [ ] **Step 2: Run RED verification**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: FAIL because the current template lacks the profile, valid JSON hook
output, configuration mode, and required compatibility contract.

- [ ] **Step 3: Implement the smallest compliant templates**

Implement a Node.js handler with an explicit POSIX command-template contract that never uses a linter suppression, installer,
network route, or plugin-root config path. It emits one JSON object, rejects an
unsupported OS or invalid `cwd` safely, uses an explicit finite event budget,
and preserves exact-file containment. Generate configuration commands only from
an approved canonical consumer path; otherwise use normal discovery.

- [ ] **Step 4: Verify GREEN against the actual strict profile**

Run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
ruff check plugins/configure-ruff-after-edit
ruff format --check plugins/configure-ruff-after-edit
npx prettier --check plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/*.mjs
```

Expected: all pass with no `noqa`, configuration relaxation, or profile change.

### Revision Task B: Update decision workflow and all user-facing documentation

**Files:**

- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/SKILL.md`
- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/environment-assessment.md`
- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/hook-design.md`
- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/sources-and-attribution.md`
- Modify: `plugins/configure-ruff-after-edit/README.md`
- Modify: `plugins/configure-ruff-after-edit/CHANGELOG.md`
- Modify: `README.md`
- Modify: `tests/configure-ruff-after-edit-skill.test.ts`

- [ ] **Step 1: Add failing documentation assertions**

Require the three choices, the four policy alternatives, strict-profile
consumer paths, no plugin-root runtime dependency, POSIX limitation, valid
PostToolUse JSON behavior, and the updated rollback instructions.

- [ ] **Step 2: Implement and verify documentation**

Document that installation remains inert; profile copying and `--config` occur
only after explicit approval; existing/default paths create no configuration;
and strict policy cannot be silently weakened. Add source attribution for Ruff
configuration discovery and `--config` precedence.

- [ ] **Step 3: Run documentation and focused verification**

Run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
npx prettier --check README.md plugins/configure-ruff-after-edit docs/superpowers/specs/2026-09-10-configure-ruff-after-edit-design.md docs/superpowers/plans/2026-09-10-configure-ruff-after-edit.md
npx markdownlint-cli2 README.md plugins/configure-ruff-after-edit/**/*.md docs/superpowers/specs/2026-09-10-configure-ruff-after-edit-design.md docs/superpowers/plans/2026-09-10-configure-ruff-after-edit.md
```

Expected: all commands pass and README claims exactly match templates.

---

### Task 1: Create the package contract and inert-by-default test

**Files:**

- Create: `tests/configure-ruff-after-edit-skill.test.ts`
- Create: `plugins/configure-ruff-after-edit/.codex-plugin/plugin.json`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/SKILL.md`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/agents/openai.yaml`
- Create: `plugins/configure-ruff-after-edit/README.md`
- Create: `plugins/configure-ruff-after-edit/CHANGELOG.md`
- Create: `plugins/configure-ruff-after-edit/LICENSE.md`

**Interfaces:**

- Consumes: repository templates and `tests/block-no-verify-skill.test.ts`.
- Produces: schema-valid skills-only package, documented safety boundary, and regression test against accidental activation.

- [ ] **Step 1: Write the failing package-contract test**

```ts
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
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: FAIL because the package does not exist.

- [ ] **Step 3: Create the smallest contract from templates**

Create a `0.1.0` manifest with template-fixed author/legal metadata and `skills: "./skills/"`; remove `apps`, `mcpServers`, `hooks`, and absent asset fields. Create one agent manifest with `policy.allow_implicit_invocation: true`. Create the initial README with required operational headings, MIT license using the verified repository convention, and a non-empty `Unreleased` changelog entry. Add the minimal skill frontmatter and its explicit-approval boundary.

- [ ] **Step 4: Verify GREEN**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: PASS for the inert skills-only contract.

### Task 2: Implement the safe Ruff handler templates test-first (superseded by Revision Task A)

> Historical task retained for traceability only. Do not execute its Python
> handler, Python maintenance test, or verification commands; Revision Task A
> is the authoritative Node.js implementation and verification contract.

**Files:**

- Modify: `tests/configure-ruff-after-edit-skill.test.ts`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/ruff_after_edit.py`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/project-hooks.json`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/user-hooks.json`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/test_ruff_after_edit.py`

**Interfaces:**

- Consumes: skills-only package and synthetic JSON hook payloads.
- Produces: inert consumer-copy templates plus a Python maintenance test.

- [ ] **Step 1: Write the failing safe-order test**

```ts
it("runs safe fixes, formatting, and final lint only for reported Python files", () => {
  const result = runPythonTemplateTest(materializeTemplates(), "safe-order");

  expect(result.status, result.stdout + result.stderr).toBe(0);
  expect(result.stdout).toContain("check --fix --no-unsafe-fixes");
  expect(result.stdout).toContain("format");
  expect(result.stdout).toContain("check");
  expect(result.stdout).not.toContain("--unsafe-fixes");
});
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: FAIL because templates and their maintenance test are absent.

- [ ] **Step 3: Implement the minimal handler and templates**

Implement standard-library-only Python 3.14 code. It parses `PostToolUse`, gathers and deduplicates directly reported existing `.py` paths, canonicalizes below `cwd`, rejects escapes/symlinks/directories/missing paths, invokes only the assessment-selected existing Ruff route, and executes safe fix → format → final check with finite timeouts. It must emit concise status without claiming a post-edit hook prevented or reverted an edit.

Create project/user JSON templates with intentionally inactive substituted paths and documented single-event matcher. The skill later chooses and merges one template; it never copies either blindly. Create a Python maintenance test with fake-Ruff fixtures.

- [ ] **Step 4: Add and run negative contract cases**

```ts
for (const scenario of [
  "multiple-files",
  "non-python",
  "outside",
  "symlink",
  "missing-ruff",
  "unfixable",
]) {
  const result = runPythonTemplateTest(materializeTemplates(), scenario);
  expect(result.status, `${scenario}: ${result.stdout}${result.stderr}`).toBe(
    0,
  );
}
```

Run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
uvx ruff@0.16.6 check --isolated plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/*.py
uvx ruff@0.16.6 format --isolated --check plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/*.py
python3 -m py_compile plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/assets/templates/ruff_after_edit.py
```

Expected: all exit `0`; the tests prove no unsafe fixes, no unreported-file writes, and safe rejected-path behavior.

### Task 3: Complete the skill, references, and package/root documentation

**Files:**

- Modify: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/SKILL.md`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/environment-assessment.md`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/hook-design.md`
- Create: `plugins/configure-ruff-after-edit/skills/configure-ruff-after-edit/references/sources-and-attribution.md`
- Modify: `plugins/configure-ruff-after-edit/README.md`
- Modify: `plugins/configure-ruff-after-edit/CHANGELOG.md`
- Modify: `README.md`
- Modify: `tests/configure-ruff-after-edit-skill.test.ts`

**Interfaces:**

- Consumes: template paths and behavior from Task 2 plus the approved design sources.
- Produces: the user-facing decision workflow, attribution, and catalog discovery.

- [ ] **Step 1: Write the failing discovery/documentation test**

```ts
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
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: FAIL because references and root discovery are missing.

- [ ] **Step 3: Author workflow and progressive references**

The skill must inspect scope, Codex/hook capability, existing layers/trust, project markers, Ruff config, and executable route before recommendation. It must show exact writes, matcher, runtime command, timeout, side effects, coverage gaps, test, activation, trust, and rollback; then wait for explicit approval. `environment-assessment.md`, `hook-design.md`, and `sources-and-attribution.md` provide conditional detail and accurate, dated attribution without copying third-party bodies or Claude-specific activation instructions.

- [ ] **Step 4: Complete package and root READMEs**

Use every required package README heading. Document no credentials/network, exact read/write/process permissions, installation behavior, approval/trust, consumer test, uninstall/rollback, limits, recovery, and non-affiliation. Add the plugin to root catalog, Ruff edit-hook use case, and exploration links consistent with adjacent entries. Update `Unreleased` with manifest, skill, templates, documentation, safety boundary, and marketplace integration.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
npx prettier --check README.md plugins/configure-ruff-after-edit docs/superpowers/specs/2026-09-10-configure-ruff-after-edit-design.md
npx markdownlint-cli2 README.md plugins/configure-ruff-after-edit/**/*.md
```

Expected: focused test and Markdown checks pass.

### Task 4: Register release/catalog data and run complete quality gates

**Files:**

- Modify: `release-please-config.json`
- Modify: `.release-please-manifest.json`
- Modify: `.agents/plugins/marketplace.json` (generated only)
- Modify: `tests/configure-ruff-after-edit-skill.test.ts`

**Interfaces:**

- Consumes: schema-valid package and root README from Tasks 1–3.
- Produces: Release Please component and exact generated marketplace registration.

- [ ] **Step 1: Add the failing release-registration assertion**

```ts
it("registers the initial package release", () => {
  expect(
    releaseConfig.packages["plugins/configure-ruff-after-edit"],
  ).toMatchObject({
    "package-name": "configure-ruff-after-edit",
    component: "plugin/configure-ruff-after-edit",
    "initial-version": "0.1.0",
    "changelog-path": "CHANGELOG.md",
  });
  expect(releaseState["plugins/configure-ruff-after-edit"]).toBe("0.1.0");
});
```

- [ ] **Step 2: Verify RED**

Run: `npx vitest run tests/configure-ruff-after-edit-skill.test.ts`

Expected: FAIL because the Release Please package is missing.

- [ ] **Step 3: Add metadata and regenerate catalog**

Add the exact adjacent-package Release Please object and `0.1.0` manifest state. Run `npm run marketplace:build` to generate the catalog; do not edit it directly.

- [ ] **Step 4: Verify focused release/catalog GREEN**

Run:

```bash
npx vitest run tests/configure-ruff-after-edit-skill.test.ts
npm run validate:release-contract
npm run marketplace:check
```

Expected: all pass; catalog source is exactly `./plugins/configure-ruff-after-edit`.

- [ ] **Step 5: Verify the complete change set**

Run:

```bash
npm run documentation:gate -- --base 129529f1be4b56cdecda697f69036ac31747de61 --head HEAD
npm run check
git diff --check
git status --short
```

Expected: documentation gate and complete check pass, `git diff --check` is empty, and status has only approved plugin, catalog, release, root README, test, design, and plan changes.

## Plan Self-Review

- **Spec coverage:** Tasks 1–4 cover skills-only packaging, explicit approval, safe Ruff order, attribution, documentation, root discovery, Release Please, catalog generation, behavior tests, and complete gates.
- **Completeness scan:** The plan has no unresolved markers or unspecified paths, commands, interfaces, or expected results.
- **Interface consistency:** Package/skill ID is `configure-ruff-after-edit`; the approved handler is `ruff_after_edit.mjs`; all package paths resolve under `plugins/configure-ruff-after-edit`.
