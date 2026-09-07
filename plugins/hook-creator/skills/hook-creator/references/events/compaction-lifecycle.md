# Compaction Lifecycle

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck compaction triggers and continuation behavior before implementation.

Read this reference for `PreCompact`, `PostCompact`, or session context immediately following
compaction.

## Shared compaction input

Both events add:

| Field     | Type   | Meaning            |
| --------- | ------ | ------------------ |
| `turn_id` | string | Active Codex turn  |
| `trigger` | string | `manual` or `auto` |

`matcher` filters `trigger`. Plain stdout is ignored. JSON supports the common output fields.

## `PreCompact`

- Runs before Codex compacts the conversation.
- `continue: false` stops before compaction.
- Use for a bounded pre-compaction decision or advisory message, not for durable memory unless the
  handler actually persists and verifies it.

Inactive TOML example:

```toml
[[hooks.PreCompact]]
matcher = "^auto$"

[[hooks.PreCompact.hooks]]
type = "command"
command = "python3 /absolute/path/pre_compact.py"
timeout = 10
```

## `PostCompact`

- Runs after Codex compacts the conversation.
- `continue: false` stops after compaction.
- Use for feedback tied to the completed compact operation.

## Context after compaction

`SessionStart` with `source: "compact"` runs before the next model request following root-session
compaction, including automatic compaction mid-turn. Use that event when the goal is to restore
concise working context to the immediate continuation. Read [session lifecycle](session-lifecycle.md)
for its output contract.

Do not emit entire transcripts or large summaries by default. Multiple hooks contribute cumulative
context, and oversized `additionalContext` may spill to disk.
