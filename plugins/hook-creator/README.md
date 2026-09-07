# 🪝 Hook Creator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Turn an operational requirement into correctly designed, wired, and verified Codex lifecycle
> hooks.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Hook Creator is a knowledge-focused Codex plugin for engineers who need to design, create, integrate,
review, test, or debug lifecycle hooks. Its concise skill routes Codex to focused references for the
exact event, handler, output, integration, trust, or automation question at hand.

The plugin contains no active hooks. Installing it does not register configuration, copy handlers,
execute scripts, or trust hook definitions.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install from the repository's
`main` catalog. This community marketplace does not imply official Plugins Directory publication or
OpenAI endorsement.

> [!CAUTION]
> Hooks can run local processes, call connected MCP tools, block or rewrite supported operations, and
> expose sensitive event data. Review generated code and the exact definition in `/hooks` before
> trusting it.

## ⚡ Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add hook-creator@codex-essentials
codex plugin list
```

If the marketplace is already configured, run
`codex plugin marketplace upgrade codex-essentials` first. Start a new thread and ask:

```text
Use $hook-creator to prevent destructive Bash commands in this repository.
Inspect existing hooks, recommend the correct design, and wait for my approval before editing.
```

## 🎯 Use cases

| Scenario                                                        | How the plugin helps                                                                                | Expected result                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A policy must stop a supported local action before side effects | Selects the correct pre-action event, matcher, synchronous handler, and failure boundary            | Complete configuration, handler, tests, trust steps, and coverage limits   |
| Hooks already exist in several config layers                    | Inventories composition, concurrency, precedence, context, paths, and trust hashes                  | A minimal integration that preserves unrelated definitions                 |
| A hook parses but does not run                                  | Follows enablement → source → discovery → trust → event → matcher → handler → output causality      | Root cause, correction, regression evidence, and unverified runtime claims |
| A hook must participate in CI or GitHub Actions                 | Separates Codex hooks from workflow orchestration and designs runner/config/trust/credential wiring | Least-privilege automation with explicit evidence boundaries               |

**Not a fit when:** the request concerns Git hooks, generic workflow triggers, or OpenAI Agents SDK
lifecycle callbacks without a Codex lifecycle hook.

## 🎯 Purpose

- Translate user intent into the correct Codex lifecycle event and contract.
- Produce complete JSON/TOML, command or MCP handlers, tests, activation, and rollback when asked.
- Integrate with existing user, project, plugin, managed, subagent, and automation contexts.
- Review and debug hooks without confusing parsing, discovery, trust, or execution evidence.
- Preserve full official knowledge while loading only the references needed for the current task.

## 🧰 Included Components

| Component                                                                                           | Purpose                                                                             |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Plugin manifest](.codex-plugin/plugin.json)                                                        | Identity, version, interface, and skill declaration                                 |
| [Hook Creator skill](skills/hook-creator/SKILL.md)                                                  | Direct operating workflow and reference router                                      |
| [Agent metadata](skills/hook-creator/agents/openai.yaml)                                            | Codex label, prompt, and implicit invocation policy                                 |
| [Architecture and layers](skills/hook-creator/references/architecture-and-layers.md)                | Lifecycle, source layers, placement, enablement, cwd, and paths                     |
| [Configuration and matchers](skills/hook-creator/references/configuration-matchers-and-coverage.md) | JSON/TOML shape, fields, regex targets, aliases, timeouts, and coverage             |
| [Handlers](skills/hook-creator/references/handlers-command-mcp-background.md)                       | Command, MCP, parameter expansion, synchronous/background, and concurrency behavior |
| [Input/output contracts](skills/hook-creator/references/input-output-contracts.md)                  | stdin, stdout, stderr, decisions, rewrites, context, exit codes, and spilling       |
| [Event index](skills/hook-creator/references/events/index.md)                                       | Routing to all 12 released lifecycle events                                         |
| [Integration and bundling](skills/hook-creator/references/integration-and-bundling.md)              | Existing hooks, agents, subagents, plugins, skills, and packaging                   |
| [CI/CD and GitHub Actions](skills/hook-creator/references/ci-cd-and-github-actions.md)              | `codex exec`, runners, trust, credentials, permissions, and pipeline evidence       |
| [Trust and managed hooks](skills/hook-creator/references/trust-managed-hooks-and-secrets.md)        | `/hooks`, managed policy, secret handling, transcripts, and bypass risks            |
| [Testing and debugging](skills/hook-creator/references/testing-and-debugging.md)                    | Layered proof, isolated fixtures, runtime checks, review, and causal diagnosis      |
| [Schema/source index](skills/hook-creator/references/schema-and-implementation-index.md)            | Commit-pinned official schema, source, and test links by event                      |
| [Source map](skills/hook-creator/references/source-map.md)                                          | Traceability from every original Hooks section and supplemental source              |
| [Changelog](CHANGELOG.md)                                                                           | User-facing package history                                                         |
| [License](LICENSE.md)                                                                               | MIT license terms                                                                   |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Codex surface | Local Codex clients that support skills and lifecycle hooks; CLI checked with 0.153.4                                         |
| Runtime/tools | No plugin runtime. Generated handlers use the target project's available Python, Bash, MCP, and validation tools              |
| Project types | User, repository, plugin, managed, custom-agent/subagent, and CI automation contexts where current docs support the mechanism |
| Credentials   | None required to use the skill; generated MCP/CI workflows retain their own credential contracts                              |
| Network       | Not required for bundled knowledge; required to refresh official docs or inspect linked source                                |
| Last verified | 2026-09-07 against published OpenAI docs and `openai/codex` revision `6750f5bd1356fe1553c0fcc9f2632704f3055946`               |

Published OpenAI documentation and the actual target Codex version take precedence over the bundled
verification snapshot. Repository `main` schemas may include unreleased fields.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** Operational objective, target scope, environment, current hook/configuration sources,
desired side effects, and available runtime/MCP/CI evidence.

**Outputs:** A design recommendation; when authorized, complete hook configuration and handler code,
tests and fixtures, integration/activation steps, trust guidance, rollback, and an evidence-scoped
completion report.

## Required Tools and Credentials

Reading the plugin requires no additional tool or credential. Implementation uses only tools required
by the selected target: for example Python/Bash, a pre-connected MCP server, Codex CLI, repository
linters/tests, or the official GitHub Action. Credential values must remain in `${VAR}` references and
secret stores.

## Permissions

| Access or effect | What this plugin may do                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Read             | Inspect authorized Codex config, hook definitions, handlers, project files, tool contracts, and diagnostics |
| Write            | Create or modify only the approved hook configuration, handlers, tests, and related documentation           |
| Process          | Run parsers, handler fixtures, linters, tests, Codex diagnostics, and authorized integration checks         |
| Network          | Read official documentation/source and call explicitly selected MCP/CI services when authorized             |
| Authentication   | None for this plugin; generated integrations use the target service's approved variables and controls       |

## Side Effects

Installation changes only Codex-managed plugin state and makes the skill discoverable. It does not
modify `~/.codex`, the target repository, CI workflows, plugin manifests, or trust state. Invoking the
skill for an authorized implementation may create the exact files described in its proposal and run
the disclosed verification commands.

## Human Approval Boundaries

Design, review, and diagnosis are read-only unless the user also asks for correction. For creation or
integration, Hook Creator first inspects the target and proposes exact event, matcher, handler,
placement, files, tests, activation, and rollback. It asks only for unresolved choices that materially
change the result. The user retains the `/hooks` trust decision and any production/remote mutation.

## Installation Behavior

Installing enables normal discovery of the bundled `hook-creator` skill. No hook source is declared
in the manifest and no conventional plugin `hooks/hooks.json` path exists, so the package itself adds
no lifecycle handler to Codex.

## 🔁 Uninstall and Rollback Behavior

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
codex plugin remove hook-creator@codex-essentials
```

Removing the plugin removes its Codex-managed installation. It does not delete hooks, handlers,
fixtures, tests, CI workflows, logs, or trust records created separately during an authorized task.
Use the implementation report's exact rollback steps or Git history to remove those artifacts.

## ✅ Verification

Maintainers can validate the package from the marketplace repository:

```bash
npm run marketplace:check
```

For a consumer smoke test, start a fresh thread and ask Hook Creator to design—without editing—a
synchronous project hook that prevents selected Bash commands. Expect it to:

- choose `PreToolUse`, not `PostToolUse`;
- match `^Bash$`;
- inspect existing hook sources;
- state hosted/specialized coverage gaps;
- specify stdin and deny output;
- require positive, negative, malformed, and live-event checks;
- leave discovery, trust, and live execution unverified until observed.

Repeat with “run this scan in the background and block on failure.” Expect Hook Creator to reject the
contradiction: a background hook cannot control the triggering operation.

## 🚧 Known Limitations

- This plugin contains knowledge, not an active enforcement component or standalone validator.
- Hook behavior depends on the target Codex version, surface, configuration layers, trust, runtime,
  MCP availability, and tool path.
- Hosted tools and specialized opt-out paths are not universally covered by tool lifecycle hooks.
- Commit-pinned schema/source links are implementation evidence, not a release contract; they require
  network access and may differ from the installed CLI.
- Custom-agent hook composition must be verified before it is presented as supported native bundling.

## Failure and Recovery

If the skill is unavailable, verify plugin installation and start a fresh thread. If a reference link
is stale, use the source map to refresh from the current official page. If a generated hook is not
working, do not reinstall blindly: follow enablement → source → discovery → trust → event → matcher →
handler → output → coexistence in the debugging reference. Disable only the affected non-managed hook
through `/hooks` or revert its exact config entry while preserving unrelated hooks.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes only Codex-managed plugin state and enables discovery of the bundled skill.
The plugin contains no active hook configuration, executable handler, or automatic project edit.
</details>

<details>
<summary>What permissions or side effects should I review?</summary>

Review the [permissions and side effects](#permissions) before authorizing implementation. Generated
hooks may read event data, execute local processes, call connected MCP tools, write approved files,
or affect supported Codex operations; the user must review and trust each exact hook definition.
</details>

<details>
<summary>How do I update, remove, or roll back this plugin?</summary>

Use the [uninstall and rollback](#-uninstall-and-rollback-behavior) instructions above. Removing the
plugin does not delete hook files created during a separate authorized task; use that task's recorded
rollback steps or Git history for those artifacts.
</details>

## 📚 Documentation and support

- [Skill workflow](skills/hook-creator/SKILL.md)
- [Official Hooks documentation](https://learn.chatgpt.com/docs/hooks)
- [Official plugin packaging](https://developers.openai.com/plugins/build/plugins)
- [Official Codex source index](skills/hook-creator/references/schema-and-implementation-index.md)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md). This independent community plugin is not endorsed by OpenAI.
Official documentation and source remain subject to their respective upstream terms.
