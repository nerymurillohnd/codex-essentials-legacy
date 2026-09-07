# Input and Output Contracts

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck event-specific output support and fields described as parsed but not implemented.

Read this reference when implementing stdin parsing, stdout/stderr behavior, exit codes, decisions,
rewrites, additional context, or large output.

## Common command input

Every command hook receives one JSON object on stdin.

| Field             | Type           | Meaning                                                    |
| ----------------- | -------------- | ---------------------------------------------------------- |
| `session_id`      | string         | Current session; subagent events use the parent session ID |
| `transcript_path` | string or null | Convenience transcript path, not a stable API              |
| `cwd`             | string         | Session working directory                                  |
| `hook_event_name` | string         | Event name                                                 |
| `model`           | string         | Codex extension: active model slug                         |

Turn-scoped events add `turn_id`. `SessionStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`,
`UserPromptSubmit`, `SubagentStart`, `SubagentStop`, `Stop`, and `Interrupt` also provide
`permission_mode`: `default`, `acceptEdits`, `plan`, `dontAsk`, or `bypassPermissions`.

Validate object type, `hook_event_name`, and every field the policy consumes. Treat transcript
content and tool data as untrusted; never assume a transcript schema remains stable.

## Common JSON output

Several context/turn events accept:

```json
{
  "continue": true,
  "stopReason": "optional",
  "systemMessage": "optional",
  "suppressOutput": false
}
```

| Field            | Meaning                                                |
| ---------------- | ------------------------------------------------------ |
| `continue`       | `false` marks that hook run as stopped where supported |
| `stopReason`     | Records why the run stopped                            |
| `systemMessage`  | Surfaces a UI/event-stream warning                     |
| `suppressOutput` | Parsed but not currently implemented                   |

`SessionStart`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop`, and `Stop` support
the common shape. `SubagentStart` accepts `systemMessage` and hook-specific context, but
`continue: false` does not prevent the subagent from starting.

`PreToolUse` and `PermissionRequest` accept `systemMessage` but not `continue`, `stopReason`, or
`suppressOutput`. `PostToolUse` accepts `systemMessage`, `continue: false`, and `stopReason`, but not
the currently unimplemented `suppressOutput`.

## Plain stdout matrix

| Event                               | Plain text on stdout                         |
| ----------------------------------- | -------------------------------------------- |
| `SessionStart`                      | Added as developer context                   |
| `SubagentStart`                     | Added as developer context for that subagent |
| `UserPromptSubmit`                  | Added as developer context                   |
| `PreToolUse`                        | Ignored                                      |
| `PermissionRequest`                 | Ignored                                      |
| `PostToolUse`                       | Ignored                                      |
| `PreCompact`, `PostCompact`         | Ignored                                      |
| `SubagentStop`, `Stop`, `Interrupt` | Invalid when exit code is 0; return JSON     |
| `SessionEnd`                        | Advisory output does not steer Codex         |

Exit 0 with no stdout is the ordinary success/continue result. Exit code 2 plus a concise stderr
reason is a supported block/feedback shorthand only for events that document it. Do not generalize
exit 2 across events without checking the event reference.

## Prevention, approval, feedback, and continuation

Pre-tool denial:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Blocked by repository policy."
  }
}
```

Pre-tool rewrite:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "command": "echo rewritten"
    }
  }
}
```

`updatedInput` is valid only with `permissionDecision: "allow"`. For Bash and `apply_patch`, it must
contain a string `command`; for other local functions and MCP calls it replaces the arguments object.

Permission decision:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "deny",
      "message": "Blocked by repository policy."
    }
  }
}
```

`behavior` is `allow` or `deny`; any deny wins across matching hooks. Omit a decision to defer to the
normal approval flow. Do not return `updatedInput`, `updatedPermissions`, or `interrupt`.

Turn/subagent continuation:

```json
{
  "decision": "block",
  "reason": "Run one more focused verification pass."
}
```

For `Stop` and `SubagentStop`, “block” means continue the flow; it is not a tool denial. Guard with
`stop_hook_active` and issue at most the designed number of continuations.

Post-tool feedback can also use `decision: "block"`, but the tool has already acted. Codex replaces
or blocks normal result processing; it does not undo side effects.

## Additional context

Events that document `hookSpecificOutput.additionalContext` can add model-visible context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load the repository conventions before editing."
  }
}
```

Keep context concise, trusted, and necessary. Context from every matching hook and plugin adds up.

## Large output and spilling

Codex normally limits each model-visible hook output to roughly 2,500 tokens. Oversized output is
saved under `<temp_dir>/hook_outputs/<session_id>/<uuid>.txt`; the model receives a head-and-tail
preview and the path. If the file write fails, it still receives a truncated preview.

`additionalContextLimit` changes the approximate threshold for command-hook additional context:

- omitted: approximately 2,500 tokens;
- positive integer: selected threshold;
- `0`: pass full additional context directly, which is dangerous without a strict producer cap.

The setting does not raise limits for tool feedback or continuation prompts. Because spilling writes
content to disk, never return secrets or unnecessarily sensitive payloads.

Always read the selected event-family reference before emitting output; similar field names have
different effects at different lifecycle points.
