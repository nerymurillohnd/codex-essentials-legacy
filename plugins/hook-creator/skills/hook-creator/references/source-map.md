# Source Map

> Primary source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Supplemental official sources are listed below.
> Last verified: 2026-09-07.
> This map records knowledge ownership; it does not prove that an external page has not changed.

Read this reference when refreshing the skill, checking whether a topic was lost, or locating the
official authority behind a statement.

## Published Hooks page coverage

| Original section                                      | Owning reference                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Hooks overview and runtime behavior                   | [Architecture and layers](architecture-and-layers.md)                           |
| Where Codex looks for hooks                           | [Architecture and layers](architecture-and-layers.md)                           |
| Review and trust hooks                                | [Trust, managed hooks, and secrets](trust-managed-hooks-and-secrets.md)         |
| Config shape and inline TOML                          | [Configuration, matchers, and coverage](configuration-matchers-and-coverage.md) |
| MCP tool hooks                                        | [Handlers](handlers-command-mcp-background.md)                                  |
| Configure an MCP tool hook                            | [Handlers](handlers-command-mcp-background.md)                                  |
| Expand arguments from the hook event                  | [Handlers](handlers-command-mcp-background.md)                                  |
| MCP execution and lifecycle                           | [Handlers](handlers-command-mcp-background.md)                                  |
| Turn hooks off                                        | [Architecture and layers](architecture-and-layers.md)                           |
| Managed hooks from `requirements.toml`                | [Trust, managed hooks, and secrets](trust-managed-hooks-and-secrets.md)         |
| Plugin-bundled hooks                                  | [Integration and bundling](integration-and-bundling.md)                         |
| Matcher patterns                                      | [Configuration, matchers, and coverage](configuration-matchers-and-coverage.md) |
| Tool coverage                                         | [Configuration, matchers, and coverage](configuration-matchers-and-coverage.md) |
| Common input fields                                   | [Input and output contracts](input-output-contracts.md)                         |
| Common output fields                                  | [Input and output contracts](input-output-contracts.md)                         |
| Large hook output                                     | [Input and output contracts](input-output-contracts.md)                         |
| Run hooks in the background                           | [Handlers](handlers-command-mcp-background.md)                                  |
| Configure a background hook                           | [Handlers](handlers-command-mcp-background.md)                                  |
| How background hooks run                              | [Handlers](handlers-command-mcp-background.md)                                  |
| Background limitations                                | [Handlers](handlers-command-mcp-background.md)                                  |
| SessionStart and SessionEnd                           | [Session lifecycle](events/session-lifecycle.md)                                |
| SubagentStart and SubagentStop                        | [Subagent lifecycle](events/subagent-lifecycle.md)                              |
| PreToolUse, PermissionRequest, PostToolUse, code mode | [Tool lifecycle](events/tool-lifecycle.md)                                      |
| PreCompact and PostCompact                            | [Compaction lifecycle](events/compaction-lifecycle.md)                          |
| UserPromptSubmit, Stop, Interrupt                     | [Prompt and turn control](events/prompt-and-turn-control.md)                    |
| Schemas                                               | [Schema and implementation index](schema-and-implementation-index.md)           |
| Plain-text aliases                                    | [Input and output contracts](input-output-contracts.md)                         |

The provided `hooks.md` snapshot ends with an incomplete “Plain-text aliases” section containing
only `string | null`. This skill does not invent the missing material; current published content must
be rechecked if that section becomes relevant.

## Supplemental official sources

| Source                                                                                                                   | Knowledge added                                                                           | Owner                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)                                     | Project trust, inline hooks, config layers, custom-agent config boundary                  | [Architecture](architecture-and-layers.md), [integration](integration-and-bundling.md)         |
| [Package your plugin](https://developers.openai.com/plugins/build/plugins)                                               | Manifest/default hook bundling, plugin paths, environment variables, trust                | [Integration and bundling](integration-and-bundling.md)                                        |
| [Build skills](https://learn.chatgpt.com/docs/build-skills)                                                              | Skill progressive disclosure and plugin distribution; no hook activation by skill install | [Integration and bundling](integration-and-bundling.md)                                        |
| [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)                                                | `agent_type`, custom-agent layers, inheritance, role boundaries                           | [Subagent lifecycle](events/subagent-lifecycle.md), [integration](integration-and-bundling.md) |
| [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)                                                | Persistent instruction discovery distinct from hooks                                      | [Integration and bundling](integration-and-bundling.md)                                        |
| [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)                                              | `codex exec`, automation, authentication, pipeline separation                             | [CI/CD and GitHub Actions](ci-cd-and-github-actions.md)                                        |
| [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action)                                                      | Action inputs, runners, permissions, outputs, security                                    | [CI/CD and GitHub Actions](ci-cd-and-github-actions.md)                                        |
| [Developer commands](https://learn.chatgpt.com/docs/developer-commands)                                                  | Current CLI surface including hook-trust bypass                                           | [CI/CD](ci-cd-and-github-actions.md), [testing](testing-and-debugging.md)                      |
| [ChatGPT and Codex changelog](https://learn.chatgpt.com/docs/changelog)                                                  | Dated release changes such as async command and MCP hooks                                 | This file and affected reference freshness notes                                               |
| [openai/codex hook source](https://github.com/openai/codex/tree/6750f5bd1356fe1553c0fcc9f2632704f3055946/codex-rs/hooks) | Generated schemas, parser, dispatcher, source, and tests at one revision                  | [Schema and implementation index](schema-and-implementation-index.md)                          |

## Authority order

1. Current published Hooks page for released hook behavior.
2. Current product/config/plugin/subagent/automation documentation for its own integration boundary.
3. Target Codex CLI help and observed runtime for version-specific behavior.
4. Commit-pinned schemas/source/tests for deeper implementation evidence.
5. Hook Creator engineering guidance derived from those facts.

If levels conflict, report the conflict and target version. Do not silently merge incompatible
claims.

## Refresh procedure

1. Fetch the current Hooks page and official documentation index.
2. Compare headings and material behavior with this table.
3. Review the previous six months of Codex changelog entries for hook/config/plugin/subagent/CLI
   changes.
4. Resolve the current `openai/codex` revision and inspect only changed hook schemas/source/tests.
5. Update affected references, their verification dates, and this map together.
6. Re-run skill/package validation and behavioral scenarios.

Do not update dates without actually revisiting the linked source.
