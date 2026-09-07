# Configuration, Matchers, and Coverage

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck matcher aliases, tool coverage, and supported handler fields against the published page.

Read this reference when authoring JSON/TOML, choosing a matcher, checking a handler declaration,
setting timeouts, or deciding whether a tool call is observable.

## Configuration shape

A hook definition has three levels:

1. event name;
2. matcher group;
3. one or more handlers in that group's `hooks` array.

```json
{
  "description": "Optional file metadata; it does not affect matching.",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /absolute/path/review.py",
            "timeout": 30,
            "statusMessage": "Reviewing command output"
          }
        ]
      }
    ]
  }
}
```

Supported handlers are `command` and `mcp_tool`. `prompt` and `agent` declarations may parse but are
skipped; do not use them as working hooks.

## Handler fields

| Field                    | Command                   | MCP tool             | Meaning                                                                    |
| ------------------------ | ------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `type`                   | Required: `command`       | Required: `mcp_tool` | Selects the runner                                                         |
| `command`                | Required non-empty string | No                   | Shell command Codex launches                                               |
| `commandWindows`         | Optional                  | No                   | Windows-specific command override                                          |
| `server`                 | No                        | Required             | Existing connected MCP server name                                         |
| `tool`                   | No                        | Required             | Tool exposed by that server                                                |
| `input`                  | No                        | Optional object      | Recursively expanded MCP arguments; defaults to `{}`                       |
| `timeout`                | Optional seconds          | Optional seconds     | Active execution timeout; normally defaults to 600                         |
| `statusMessage`          | Optional                  | Optional             | UI status while running                                                    |
| `additionalContextLimit` | Optional                  | No                   | Approximate token threshold for command `additionalContext`                |
| `async`                  | Optional boolean          | No                   | Runs a command in the background; removes control of the triggering action |

In inline TOML, `command_windows` and `commandWindows` are accepted spellings for the Windows
override. Verify current aliases before standardizing an existing file.

## Matcher targets

`matcher` is a regex. Omit it, use `""`, or use `"*"` only when every occurrence is intentional.

| Event               | Matcher target        | Current values or notes                      |
| ------------------- | --------------------- | -------------------------------------------- |
| `SessionStart`      | `source`              | `startup`, `resume`, `clear`, `compact`      |
| `SessionEnd`        | `reason`              | Currently `other`                            |
| `SubagentStart`     | `agent_type`          | Custom or built-in subagent type             |
| `SubagentStop`      | `agent_type`          | Custom or built-in subagent type             |
| `PreToolUse`        | tool name and aliases | Local function-tool path                     |
| `PermissionRequest` | tool name and aliases | Only when Codex is about to ask for approval |
| `PostToolUse`       | tool name and aliases | Local function-tool path after output        |
| `PreCompact`        | `trigger`             | `manual`, `auto`                             |
| `PostCompact`       | `trigger`             | `manual`, `auto`                             |
| `UserPromptSubmit`  | Ignored               | Filter inside the handler if needed          |
| `Stop`              | Ignored               | Filter inside the handler if needed          |
| `Interrupt`         | Ignored               | Filter inside the handler if needed          |

Using a matcher on an ignored event is not a harmless filter: the handler still sees every event.
Remove it and implement explicit input filtering where the policy requires it.

## Tool names and aliases

- Shell and unified exec match `Bash`.
- `apply_patch` reports the canonical name `apply_patch` and also matches `Edit` or `Write`.
- MCP calls match their fully qualified name, such as `mcp__filesystem__read_file`.
- Other local function tools match their registered name.
- `spawn_agent` also matches the `Agent` alias.
- `write_stdin` transports an existing exec session. It does not retrigger `PreToolUse`; its poll can
  deliver the original command's `PostToolUse` when execution finishes.

Use anchored matchers for one exact target:

```text
^Bash$
^apply_patch$
^mcp__filesystem__read_file$
```

Use alternation or a namespace regex only when broader scope is intentional:

```text
Edit|Write
^mcp__filesystem__.*
startup|resume|clear|compact
manual|auto
```

## Coverage boundary

| Tool path                        | Pre     | Post    | Boundary                                             |
| -------------------------------- | ------- | ------- | ---------------------------------------------------- |
| Shell commands                   | Yes     | Yes     | Match `Bash`                                         |
| Unified exec                     | Yes     | Yes     | Match `Bash`; polling does not retrigger pre-use     |
| `apply_patch`                    | Yes     | Yes     | Canonical name plus `Edit`/`Write` aliases           |
| MCP tools                        | Yes     | Yes     | Fully qualified name                                 |
| Other local function tools       | Usually | Usually | Match registered name; specialized paths may opt out |
| Hosted tools such as `WebSearch` | No      | No      | They do not use the local function-tool hook path    |

Never promise universal enforcement from a tool matcher. State hosted and opted-out paths as a
coverage gap.

## Timeout and context fields

- Most handlers default to 600 seconds. Choose an intentional shorter bound for interactive work.
- `SessionEnd` and `Interrupt` default to 1 second and support at most 3 seconds.
- `SessionEnd` always runs synchronously, even if `async` is present.
- MCP execution uses the shorter hook/server timeout; time waiting on MCP elicitation does not count
  against it.
- `additionalContextLimit` applies only to command-hook `additionalContext`. It is ignored with a
  warning for events that cannot produce context.

After the configuration shape is fixed, read [handlers](handlers-command-mcp-background.md) for
execution or [input/output contracts](input-output-contracts.md) for emitted data.
