# Architecture and Layers

> Official sources: [Hooks](https://learn.chatgpt.com/docs/hooks),
> [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
> and [Package your plugin](https://developers.openai.com/plugins/build/plugins).
> Last verified: 2026-09-07.
> Recheck before relying on version-sensitive discovery, trust, or managed-policy behavior.

Read this reference when deciding when a hook runs, where configuration or handlers belong, which
layer owns the behavior, or why a definition is not discovered.

## Lifecycle map

| Moment                            | Events                      | Use for                                     |
| --------------------------------- | --------------------------- | ------------------------------------------- |
| Session starts                    | `SessionStart`              | Startup/resume/clear/compact context        |
| Subagent starts                   | `SubagentStart`             | Context or observation for an `agent_type`  |
| Before a user prompt              | `UserPromptSubmit`          | Prompt context or rejection                 |
| Before a local tool               | `PreToolUse`                | Prevention, rewrite, or pre-tool context    |
| Before an approval prompt         | `PermissionRequest`         | Allow, deny, or defer the approval decision |
| After a local tool                | `PostToolUse`               | Feedback after effects already occurred     |
| Around compaction                 | `PreCompact`, `PostCompact` | Stop or annotate compaction flow            |
| When a subagent/root turn stops   | `SubagentStop`, `Stop`      | Bounded continuation or stop feedback       |
| When the main turn is interrupted | `Interrupt`                 | Short advisory logging or cleanup           |
| When the main session ends        | `SessionEnd`                | Short advisory persistence or cleanup       |

Select by required timing, not by a familiar name. Prevention must happen before the side effect;
post-action feedback cannot roll it back. Read [the event index](events/index.md) before finalizing
the event.

## Configuration layers

| Scope   | Configuration                                             | Handler path                      | Trust and ownership                                                                |
| ------- | --------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| User    | `~/.codex/hooks.json` or `~/.codex/config.toml`           | Stable user-controlled path       | Independent of project trust; affects every applicable session                     |
| Project | `<repo>/.codex/hooks.json` or `<repo>/.codex/config.toml` | Resolve from the Git root         | Project layer loads only when that project is trusted                              |
| Plugin  | Default `hooks/hooks.json` or manifest `hooks` entry      | Resolve with `${PLUGIN_ROOT}`     | Enabled plugin source; still requires non-managed hook review/trust                |
| Managed | Inline `[hooks]` in `requirements.toml`                   | Absolute path under `managed_dir` | Trusted and enforced by policy; distributed scripts remain an admin responsibility |

Active sources are additive. Matching hooks from different files and layers all run. Higher config
precedence does not replace lower hooks. Inventory every relevant source before adding another.

If a single layer contains both `hooks.json` and inline `[hooks]`, Codex merges both and warns at
startup. Prefer one representation per layer.

## JSON or TOML

Choose the representation already owned by the target layer. Use JSON when lifecycle configuration
has its own file; use TOML when the same owner intentionally keeps it beside other Codex settings.

Inactive project JSON example:

```json
{
  "description": "Review before trusting this workspace hook.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/env python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Equivalent inactive TOML example:

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/env python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py"'
timeout = 10
```

Do not create both examples in the same layer. These snippets are knowledge, not installed hooks.

## Enablement and trust

Hooks are enabled by default. A user or administrator can disable them with:

```toml
[features]
hooks = false
```

`hooks` is canonical; `codex_hooks` is a deprecated alias. In an untrusted project, Codex ignores
project `.codex` configuration, including project hooks, while user and system layers remain active.

Discovery and execution are separate:

1. Codex finds an active source.
2. Codex lists the definition.
3. Non-managed definitions require review and trust for their current hash.
4. The lifecycle event occurs.
5. The matcher, if supported, matches.
6. Codex invokes the handler.

Changing the definition changes its hash and returns it to review. Use `/hooks` to inspect the exact
source and trust state. Never describe installation or file presence as activation proof.

## Working directory and stable paths

Command hooks start with the session `cwd`, not the directory containing `hooks.json`. A relative
path such as `.codex/hooks/policy.py` breaks when Codex starts in a repository subdirectory.

For a project hook, resolve the Git root in the command. For a managed hook, use an absolute path
inside the configured managed directory. For a plugin hook, use `${PLUGIN_ROOT}` rather than a
checkout-specific path. Add `commandWindows` in JSON or `command_windows`/`commandWindows` in TOML
when the same hook supports Windows.

## Placement decision

- Choose **user** only for behavior the user wants across repositories.
- Choose **project** for versioned repository behavior shared with collaborators.
- Choose **plugin** when hook activation is an intentional component of an installable plugin.
- Choose **managed** only for administrator-owned policy and external script distribution.
- Do not use a skill directory as an activation layer. A skill can teach or create hooks, but its
  installation is not hook registration.

After selecting placement, read [configuration, matchers, and
coverage](configuration-matchers-and-coverage.md). If another source already exists, also read
[integration and bundling](integration-and-bundling.md).
