# Session Lifecycle

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck session-end triggers, timeout limits, and compact-resume behavior.

Read this reference for `SessionStart` or `SessionEnd`.

## `SessionStart`

- Runs when the main session starts with `source`: `startup`, `resume`, `clear`, or `compact`.
- `matcher` filters that `source`.
- Adds `source` and `permission_mode` to the common fields.
- Plain stdout becomes extra developer context.
- JSON can return common fields, `systemMessage`, or
  `hookSpecificOutput.additionalContext` with `hookEventName: "SessionStart"`.
- `continue: false` ends the turn without another model request.
- After root-session compaction, a `source: "compact"` hook runs before the immediate continuation,
  including automatic compaction in the middle of a turn.

Inactive JSON example:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|compact",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /absolute/path/session_context.py",
            "timeout": 10,
            "additionalContextLimit": 3000
          }
        ]
      }
    ]
  }
}
```

Structured context output:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load the workspace conventions before editing."
  }
}
```

Use startup context for concise, trusted, task-relevant material. Do not inject untrusted repository
content without labeling or validation, and account for cumulative context from other hooks/plugins.

## `SessionEnd`

- Runs only for the main thread when an open conversation is archived/deleted, Codex closes normally,
  or a conversation remains idle and unopened by connected clients for 30 minutes.
- Switching conversations or `thread/unsubscribe` does not immediately end the session.
- `matcher` filters `reason`; the current documented value is `other`.
- Input adds `reason`; `permission_mode` is not listed for this event.
- The transcript remains readable while the handler runs, but its format is not stable.
- Supports command handlers only; MCP tool hooks are unsupported.
- Always runs synchronously, including when `async: true` is configured.
- Defaults to 1 second and supports 1–3 seconds.
- Is advisory: output cannot steer Codex or keep the thread open.
- Timeout or nonzero exit is reported as a hook failure.

Example input:

```json
{
  "session_id": "thr_123",
  "transcript_path": "/workspace/.codex/rollout.jsonl",
  "cwd": "/workspace",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

Keep cleanup bounded and idempotent. Do not depend on network completion inside a three-second
window, and do not claim persistence succeeded without inspecting the handler result/artifact.
