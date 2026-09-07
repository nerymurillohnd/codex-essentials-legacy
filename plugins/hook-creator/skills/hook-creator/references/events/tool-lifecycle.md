# Tool Lifecycle

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck supported/parsed fields, tool aliases, and code-mode behavior before implementation.

Read this reference for `PreToolUse`, `PermissionRequest`, `PostToolUse`, or code-mode tool calls.

## Shared tool input

Tool events add `turn_id`, `tool_name`, `tool_input`, and normally `tool_use_id` to common fields.
Bash and `apply_patch` use `tool_input.command`; MCP and other local function tools send their
arguments. `PostToolUse` also adds `tool_response`. `PermissionRequest` may include
`tool_input.description`, but not every tool provides it.

## `PreToolUse`

Use synchronous `PreToolUse` to intercept a supported local call before execution.

- `matcher` filters `tool_name` and documented aliases.
- Plain stdout is ignored.
- Deny with `hookSpecificOutput.permissionDecision: "deny"` and a reason.
- Rewrite with `permissionDecision: "allow"` plus `updatedInput`.
- Bash and `apply_patch` rewrites require string `updatedInput.command`; other functions use a
  replacement argument object.
- `decision: "block"`/`reason` is an older accepted deny shape.
- Exit 2 plus stderr can block with a reason.
- `permissionDecision: "ask"`, legacy `decision: "approve"`, `continue: false`, `stopReason`, and
  `suppressOutput` are currently unsupported: Codex reports failure and continues the tool call.
- Background execution cannot control the triggering call.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by repository policy."
  }
}
```

## `PermissionRequest`

Use this event only when Codex is about to surface an approval request. Calls requiring no approval
do not trigger it.

- `matcher` filters tool name and aliases.
- Plain stdout is ignored.
- Return `decision.behavior: "allow"` or `"deny"` inside `hookSpecificOutput`.
- A deny may include `message`; any deny wins across matching hooks.
- No decision defers to the normal approval flow.
- `updatedInput`, `updatedPermissions`, and `interrupt` are reserved/unsupported and fail closed.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow"
    }
  }
}
```

Approval decisions are not tool rewrites. If input must change, use synchronous `PreToolUse` where
that tool path is covered.

## `PostToolUse`

Runs after a supported tool returns, including a nonzero Bash result. It cannot undo side effects.

- `matcher` filters tool name and aliases.
- Plain stdout is ignored.
- `decision: "block"` or exit 2 replaces/blocks normal result processing with hook feedback and
  continues the model; it does not roll back the tool.
- `continue: false` replaces normal processing with the hook feedback/stop text but has distinct
  code-mode behavior described below.
- JSON may include `systemMessage`, `stopReason`, and
  `hookSpecificOutput.additionalContext` with `hookEventName: "PostToolUse"`.
- `updatedMCPToolOutput` and `suppressOutput` are parsed but unsupported; failure is reported and
  normal processing continues.

```json
{
  "decision": "block",
  "reason": "The command output requires review.",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "The command modified generated files."
  }
}
```

## Code mode

Hooks apply to nested tool calls made from JavaScript code mode:

| Result                                  | Nested code sees                                                 |
| --------------------------------------- | ---------------------------------------------------------------- |
| `PreToolUse` denies                     | Tool promise rejects before execution                            |
| `PreToolUse` rewrites                   | Tool runs with updated input; promise resolves with its result   |
| `PostToolUse` blocks or exits 2         | Tool ran; promise rejects with the hook reason                   |
| `PostToolUse` returns `continue: false` | Model-visible result changes, but nested promise is not rejected |

Test both ordinary and code-mode paths when the control claims to cover both. Hosted tools and
specialized opt-out paths remain outside normal coverage.
