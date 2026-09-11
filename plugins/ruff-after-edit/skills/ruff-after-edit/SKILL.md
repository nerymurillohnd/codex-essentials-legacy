---
name: ruff-after-edit
description: Use when linting, formatting, fixing, or configuring Ruff in Python projects, or when the user asks for a Codex Ruff after-edit hook. Use normal Ruff guidance for intentional commands; load hook wiring only when hook design or installation is requested.
---

# Ruff After Edit

Use Ruff deliberately for Python linting and formatting. When explicitly asked,
design an approval-gated Codex after-edit workflow. Installing this plugin
exposes guidance only; it never creates, activates, trusts, or runs a hook.

## Route the request

1. **Intentional Ruff use:** lint, format, explain a rule, fix a file, or
   assess Ruff configuration. Follow this file only; do not load hook workflow
   references merely because Python is involved.
2. **Hook workflow:** create, change, wire, test, review, or troubleshoot an
   after-edit hook. Read the workflow reference, then only the references that
   match the selected policy and scope.

## Intentional Ruff use

Inspect the project first. Preserve its existing `pyproject.toml`, `ruff.toml`,
or `.ruff.toml` configuration. Scope fixes to the files being changed; show a
diff or ask before formatting unrelated legacy code.

Select one verified route:

- `uv run ruff ...` when Ruff is a dependency of the uv-managed project.
- An approved project-local or `PATH` Ruff executable when that is the
  existing route.
- `uvx ruff ...` only with explicit approval when Ruff is not a project
  dependency; it can resolve or download a tool.

```bash
<ruff> check <path>
<ruff> check --fix --no-unsafe-fixes <path>
<ruff> format <path>
<ruff> format --check <path>
```

Run safe lint fixes before formatting. Never add `--unsafe-fixes`, `noqa`,
`type: ignore`, rule-selection overrides, ignores, exclusions, or suppressions
to make a check pass. Explain and resolve remaining diagnostics in source when
authorized.

## Hook workflow

Read [the four-layer workflow](references/codex-four-layer-ruff-workflow.md).
First revalidate the released contract in
[official Codex Hooks documentation](references/official-codex-hooks.md).
Before a write, assess the operating system, selected user/repository/directory
scope, existing Codex hook sources, Ruff configuration, baseline diagnostics,
and a verified Ruff route.

Obtain explicit approval for the scope, policy, command route, exact files,
selected hook representation (`hooks.json` or `config.toml`), validation scope,
test, `/hooks` review, trust, and rollback.

The hook pair is mandatory once hook installation is approved:

- `PostToolUse` runs `ruff-after-edit.sh` for reported Python edits.
- `Stop` runs `ruff-check-on-stop.sh`, emits diagnostics on standard error, and
  exits `2` until the approved Ruff scope is clean.

Read exactly one wiring reference:

- [Bundled strict profile wiring](references/bundled-strict-profile-hook-wiring.md)
  for the consumer-owned `.codex/ruff.toml` profile.
- [Defaults and adapted configuration wiring](references/defaults-and-adapted-config-hook-wiring.md)
  for defaults, existing discovery, or reviewed project-owned configuration.

Then read both script contracts:

- [PostToolUse script](references/ruff-after-edit-script.md)
- [Stop gate script](references/ruff-check-on-stop-script.md)
- [Codex hook validation](references/codex-hook-validation.md)

Use one hook representation per scope. Preserve unrelated hooks and
configuration. Do not create a plugin hook component, install dependencies, or
trust a definition on the user's behalf. A `Stop` gate prevents a clean turn
completion; it does not prohibit every subsequent tool call during continuation.

## Sources

This skill consolidates, without affiliation, Astral's public
[Ruff skill](https://github.com/astral-sh/claude-code-plugins/blob/main/plugins/astral/skills/ruff/SKILL.md),
[uv skill](https://github.com/astral-sh/claude-code-plugins/blob/main/plugins/astral/skills/uv/SKILL.md),
[Ruff documentation](https://docs.astral.sh/ruff/),
[uv documentation](https://docs.astral.sh/uv/llms.txt), and the
[PyDevTools four-layer guide](https://pydevtools.com/handbook/how-to/how-to-configure-ruff-with-claude-code/).
