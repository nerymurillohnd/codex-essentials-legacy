# Configure Ruff After Edit Design

**Status:** Approved for implementation on 2026-09-10  
**Repository revision inspected:** `129529f1be4b56cdecda697f69036ac31747de61`  
**Scope:** A new marketplace plugin and its catalog, release, tests, and root-README integration.

## Goal

Provide an installable Codex plugin that helps a user assess a Python project and,
only after explicit approval, create a narrowly scoped Codex hook that runs the
project's Ruff lint-fix and formatter on Python files reported as edited by
Codex. Installing the plugin must never activate, register, trust, or execute a
hook.

## Non-goals

- Bundle an active `hooks/hooks.json` or declare a `hooks` component in the
  plugin manifest.
- Install Ruff, uv, Python, dependencies, environments, editor extensions, or
  pre-commit hooks.
- Create, replace, or force a Ruff configuration without the user's separate,
  explicit choice and approval; add suppressions; or apply unsafe Ruff fixes.
- Reformat a repository, expand a file event into a directory/glob, block a
  commit, or claim CI/commit enforcement.
- Automate the user's Codex hook-review or trust decision.
- Support or modify Claude Code configuration. Third-party examples are
  attribution and design input only.

## Product Boundary

The new package is named `configure-ruff-after-edit`. It contains one skill,
inert templates, focused references, package documentation, a license, and
tests. It does not contain a plugin hook component. Its manifest therefore
declares only `"skills": "./skills/"`.

Installing the package affects Codex-managed plugin discovery only. It does not
create `.codex/`, change a target repository, invoke Ruff, or alter global
Codex hook settings. The generated hook is a separately approved output owned
by the target user or project.

## User Workflow

1. The user explicitly invokes `$configure-ruff-after-edit` to request an
   assessment, hook design, review, repair, or approved installation.
2. The skill performs read-only discovery: operating system, Codex version and
   hook capability, requested scope, Git root, existing user/project/plugin
   hook sources, active trust state, Python project markers, Ruff configuration,
   and the already available Ruff execution path.
3. The skill asks the user to select hook scope (global, project/repository, or
   directory-bounded), policy source (bundled strict profile, discovered
   configuration, reviewed adjustment, or Ruff defaults), and whether a new
   configuration file may be materialized. The bundled profile always requires
   a consumer-owned copy; a hook never references a file under `PLUGIN_ROOT`.
4. It presents a concrete recommendation. The recommendation states selected
   scope; all files to be written; exact matcher; runtime command; timeout;
   safe-fix behavior; coverage gaps; interactions with existing hooks; test;
   activation; trust; and rollback steps.
5. The skill stops until the user explicitly approves both scope and writes.
6. After approval, it writes only the agreed handler, configuration merge, and
   optional maintenance test. It preserves unrelated hook groups and never
   creates both `hooks.json` and inline hook TOML in the same layer.
7. It validates syntax and executes the generated test with synthetic input.
   The user reviews the exact hook in `/hooks` and independently chooses whether
   to trust it. Live discovery, trust, and event execution remain distinct
   verification levels.

The supported installation targets are a project-owned `.codex/hooks.json` or
a user-owned `~/.codex/hooks.json` / `~/.codex/config.toml`, selected by the
user. Project scope is the default recommendation when the behavior belongs to
one version-controlled project; user scope is appropriate only when the user
wants it across projects and accepts the wider effect.

## Configuration Selection and Materialization

The package distributes the approved strict baseline as
`skills/configure-ruff-after-edit/assets/templates/ruff.toml`. It is a
reference/template, not active plugin configuration and not a hook dependency.

- For a global hook with that profile, copy it after approval to
  `~/.codex/ruff.toml` and pass the canonical path with `--config`.
- For a project/repository hook with that profile, copy it after approval to
  `<project-root>/.codex/ruff.toml` and pass the canonical path with `--config`.
- For a project with no Ruff configuration, the user may instead approve a
  root `ruff.toml`; Ruff then discovers it and the hook omits `--config`.
- For an existing configuration or Ruff defaults, create nothing and do not
  pass `--config`; Ruff performs normal discovery or applies its defaults.
- For a reviewed custom profile, write only the user-approved content to the
  selected consumer-owned path.

`~/.ruff.toml` and `~/.config/ruff/ruff.toml` are not automatic global
fallback paths. Ruff documents `${config_dir}/ruff/pyproject.toml` for that
purpose; this design uses the explicit `~/.codex/ruff.toml` plus `--config`
route so the effect is auditable. An arbitrary directory is an execution
boundary, not automatically a discoverable Codex configuration layer.

## Generated Hook Contract

The skill generates a Node.js handler and a single `PostToolUse` command-hook
configuration only after approval. It selects the smallest matcher verified for
the installed Codex client that covers its Python edit path. It must not promise
coverage for hosted tools, non-observable tools, or arbitrary shell writes.

For each event, the handler must:

1. Parse JSON from standard input defensively and validate the expected event.
2. Extract only directly reported target paths, including supported direct path
   fields and `apply_patch` Add/Update directives.
3. Deduplicate files, accept existing regular `.py` files only, and canonicalize
   them against the event working directory. It rejects absolute escapes,
   symlinks resolving outside that directory, directories, deleted files, and
   unreported files.
4. Resolve an existing Ruff executable from the assessed target project without
   installation or network access. It may use only an existing project-local
   Ruff or a verified `PATH` executable; it never calls `uv`, `uv run`, `uvx`,
   `pip`, or a package installer. The assessment records the selected route.
5. Run, for each eligible file and in order, `ruff check --fix
--no-unsafe-fixes <file>`, `ruff format <file>`, and a final `ruff check
<file>`, using either the approved canonical `--config` file or the project's
   normal Ruff discovery, with a finite total-event timeout.
6. Emit one valid `PostToolUse` JSON object with a concise, non-sensitive
   `systemMessage`, and avoid converting an
   already-completed edit into an unbounded continuation loop. An unfixable
   diagnostic is reported; the generated `PostToolUse` hook does not claim to
   undo the edit or enforce a repository gate.

The initial handler requires an already available Node.js runtime and must skip
safely when it is absent. It must not pass `--isolated`, overwrite a
configuration path, invoke `uv`, `uvx`, use `pip`, add `--unsafe-fixes`, add a
Ruff suppression, or relax the bundled profile. Any future Stop-hook or whole-project
lint option is out of scope and needs a separate design and approval because it
changes cost, failure, and continuation behavior.

## Package Layout

```text
plugins/configure-ruff-after-edit/
├── .codex-plugin/plugin.json
├── CHANGELOG.md
├── LICENSE.md
├── README.md
└── skills/configure-ruff-after-edit/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── assets/templates/
    │   ├── ruff.toml
    │   ├── project-hooks.json
    │   ├── user-hooks.json
    │   ├── ruff_after_edit.mjs
    │   └── test_ruff_after_edit.mjs
    └── references/
        ├── environment-assessment.md
        ├── hook-design.md
        └── sources-and-attribution.md
```

`plugin.json`, `README.md`, `CHANGELOG.md`, `LICENSE.md`, and
`agents/openai.yaml` start from the repository's matching templates and are
then reduced to evidence-backed, package-specific content. `LICENSE.md` uses
the repository's established MIT holder and year only after verifying the
current license convention. The README documents inputs, output, permissions,
side effects, approval gates, activation, trust, rollback, verification,
limitations, failures, and attribution.

`sources-and-attribution.md` contains links, access dates, and a concise account
of what each public source informed. It explicitly states that this plugin is
independent, community-maintained, and not affiliated with Astral, OpenAI, or
PyDevTools. It must not reproduce third-party skills or examples beyond short,
necessary attributed excerpts permitted by their licenses and the repository's
documentation rules.

## Release and Marketplace Integration

- Add the package as a new Release Please component with initial version
  `0.1.0` in `release-please-config.json` and
  `.release-please-manifest.json`.
- Generate, rather than hand-edit, `.agents/plugins/marketplace.json` from the
  manifest using `npm run marketplace:build`.
- Add the plugin to the root `README.md` catalog, relevant use-case row, and
  keyword exploration links, following the existing ordering and wording
  conventions.
- Add focused TypeScript tests that assert package contract, inactive-by-default
  behavior, required sources, root-README inclusion, template behavior, and
  release configuration. The repository test suite remains the integration
  gate.

## Acceptance Criteria

1. The marketplace recognizes a schema-valid, self-contained
   `configure-ruff-after-edit` package with exactly one distributed skill and
   agent metadata.
2. Installing the plugin alone cannot discover an active packaged hook because
   the manifest declares no hook component and the package has no active hook
   configuration.
3. The skill requires read-only assessment and explicit approval before every
   configuration or handler write; it preserves existing sources and does not
   infer user or project scope.
4. The skill presents and records the three configuration decisions; strict
   profile selection creates only a user-approved, consumer-owned file, while
   existing/default configuration selection does not create or force a file.
5. Templates preserve the selected Ruff policy, perform safe fixes before
   formatting, constrain processing to canonical event-reported Python files,
   emit valid hook JSON, and do not install or download tools.
6. Documentation includes factual compatibility limits, hook trust/activation
   steps, attribution, no-affiliation language, recovery steps, and the
   difference between event hygiene and CI/commit enforcement.
7. Release configuration, generated marketplace catalog, root README, manifest,
   package README, changelog, license, agent metadata, and tests remain
   synchronized.
8. Formatting, linting, type checks, tests, package validation, marketplace
   generation/check, documentation gate, and the full repository check pass.

## Evidence and Attribution

- Ruff is both a Python linter and formatter; its configuration discovery is
  hierarchical, so generated commands must preserve target-project policy.
  [Ruff documentation](https://docs.astral.sh/ruff/) (undated; accessed
  2026-09-10).
- Ruff accepts `pyproject.toml`, `ruff.toml`, and `.ruff.toml`; it uses the
  nearest configuration rather than merging parent files, while direct
  `--config` selects one configuration for all analyzed files. Its documented
  user fallback is `${config_dir}/ruff/pyproject.toml`.
  [Ruff configuration documentation](https://docs.astral.sh/ruff/configuration/)
  (undated; accessed 2026-09-10).
- Astral's published Ruff guidance recommends scoping fixes to edited files,
  applying `ruff check --fix` before `ruff format`, and reviewing unsafe fixes
  before use. [Astral Ruff skill](https://github.com/astral-sh/claude-code-plugins/blob/main/plugins/astral/skills/ruff/SKILL.md)
  (2026-02-27; accessed 2026-09-10).
- Astral's uv guidance distinguishes project execution through `uv run` from
  one-off tools through `uvx`; the generated workflow must never install or
  resolve a new tool implicitly. [Astral uv skill](https://github.com/astral-sh/claude-code-plugins/blob/main/plugins/astral/skills/uv/SKILL.md)
  (2026-02-27; accessed 2026-09-10) and [uv documentation index](https://docs.astral.sh/uv/llms.txt)
  (undated; accessed 2026-09-10).
- A third-party article usefully separates assistant guidance, an edit hook,
  and commit enforcement. Its Claude-specific configuration is not reused;
  this design uses it only as credited conceptual input. [PyDevTools article](https://pydevtools.com/handbook/how-to/how-to-configure-ruff-with-claude-code/)
  (2026-09-07).
- Current local `hook-creator` references, sourced from the official Codex Hooks
  documentation and rechecked 2026-09-07, establish that hook sources compose,
  `PostToolUse` happens after an edit, plugin installation and hook trust are
  distinct, and a skill itself is not an activation layer. The implementation
  must recheck the published hook contract against the target Codex version
  before writing a consumer hook.

## Verification Plan

The implementation uses test-first development for new template/contract code:
write a focused failing test, observe the expected failure, implement the
smallest satisfying resource, and rerun the test. Tests use synthetic hook
payloads and temporary directories to cover a safe Python file, multiple edited
files, a non-Python file, missing/external/symlink paths, unavailable Ruff,
unfixable lint output, existing hook composition, and the absence of an active
plugin hook.

Maintainer verification includes the focused tests, `npm run marketplace:build`,
`npm run marketplace:check`, the documentation gate against the actual base and
head revisions, and `npm run check`. Consumer verification distinguishes static
parsing, generated handler behavior, Codex discovery, user trust, and live event
execution; only the first two are automated in this repository.
