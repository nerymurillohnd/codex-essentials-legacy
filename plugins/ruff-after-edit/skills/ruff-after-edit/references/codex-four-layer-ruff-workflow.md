# Four-Layer Ruff Workflow for Codex

This is the Codex adaptation of the four-layer Ruff workflow described by
[PyDevTools](https://pydevtools.com/handbook/how-to/how-to-configure-ruff-with-claude-code/).
It is reference material only. Installing this plugin creates none of these
files, activates no hook, and installs no dependency.

The layers are complementary:

| Layer               | Codex adaptation                                                                               | Responsibility                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Project instruction | A reviewed Ruff section in the repository's `AGENTS.md` or existing contributor documentation. | Tell the agent which Ruff route and policy apply.                                            |
| On-demand guidance  | This plugin's `configure-ruff-after-edit` skill and its Ruff references.                       | Assess the environment and propose the exact approved configuration.                         |
| Runtime hook pair   | Codex `PostToolUse` plus mandatory `Stop` Bash handlers.                                       | Fix and format edits, then prevent a clean turn completion with unresolved Ruff diagnostics. |
| Commit gate         | An approved `.pre-commit-config.yaml` entry.                                                   | Check commits from Codex, humans, and other tools.                                           |

Do not use Claude paths, `CLAUDE.md`, `.claude/settings.json`, Claude command
names, or Claude environment variables. Codex uses its own `AGENTS.md` and
`.codex/` configuration layers.

## 1. Project instruction

Add only after reviewing the repository's existing instructions and receiving
approval. Preserve its commands and configuration policy; do not append this
verbatim if the project does not use uv.

```markdown
## Linting and formatting

This project uses Ruff for linting and formatting. Use the approved command
route: `uv run ruff` for the verified uv-managed project, an approved direct
Ruff executable when available, or `uvx ruff` only when explicitly approved.

- Lint: `<approved-ruff-route> check .`
- Lint and safe auto-fix: `<approved-ruff-route> check --fix --no-unsafe-fixes .`
- Format: `<approved-ruff-route> format .`
- Check formatting without writing: `uv run ruff format --check .`

Use the project's existing Ruff configuration. Do not add suppressions,
ignore rules, exclusions, or unsafe fixes to make a check pass.

When the approved policy is the plugin strict profile materialized at
`.codex/ruff.toml`, pass `--config <approved-.codex-ruff.toml-path>` to every
Ruff command, including the `Stop` gate.
```

## 2. On-demand guidance

The skill is not enforcement. It instructs the agent to inspect the operating
system, Codex hook sources, existing Ruff configuration, the executable route,
and baseline violations before proposing writes. It must obtain explicit user
approval before creating a project instruction, a Bash handler, hook
configuration, a Ruff configuration, or a commit gate.

## 3. Mandatory runtime hook pair

The pair is indivisible:

- `PostToolUse` calls `ruff-after-edit.sh` for each reported Python edit.
- `Stop` calls `ruff-check-on-stop.sh` for the approved validation scope.

The first handler applies safe fixes and formatting. The second runs Ruff
validation, writes unresolved diagnostics to standard error, and exits `2` so
Codex does not treat the turn as successfully complete. It must use the same
approved Ruff configuration route as the post-edit handler.

For the exact combined Codex `hooks.json` and `config.toml` snippets, use one
of these references:

- [Bundled strict profile wiring](bundled-strict-profile-hook-wiring.md)
- [Defaults and adapted configuration wiring](defaults-and-adapted-config-hook-wiring.md)

Choose only one representation (`hooks.json` or `config.toml`) per selected
scope. The project layer is `<repo>/.codex/`; the user/global layer is
`~/.codex/`. The handlers are consumer-owned Bash files, not plugin hooks.

## 4. Commit gate

Offer this layer only after the user approves a commit-time gate and the
repository does not already own an incompatible pre-commit configuration. The
agent must review and select a compatible, current release tag instead of
inventing one.

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: <reviewed-compatible-release-tag>
    hooks:
      - id: ruff-check
        args: [--fix]
      - id: ruff-format
```

This gate is not a substitute for the Codex hook pair. It protects commits
made by humans, IDEs, and other agents; `PostToolUse` and `Stop` protect the
Codex editing loop before a commit is attempted.

## Validation and boundaries

Before trusting the configuration, validate the selected JSON or TOML, test
both Bash handlers with synthetic hook input, inspect the exact definitions in
`/hooks`, and let the user decide trust. A `Stop` hook can prevent a clean turn
completion and surface Ruff diagnostics; it cannot itself prohibit every tool
call the agent may make after receiving that continuation.
