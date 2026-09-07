# Command, MCP, and Background Handlers

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck MCP lifecycle, background delivery, concurrency limits, and failure behavior before use.

Read this reference when implementing a handler or deciding between a local process, an existing MCP
tool, synchronous control, and background information delivery.

## Choose the handler

| Need                                                                       | Handler    | Execution                                           |
| -------------------------------------------------------------------------- | ---------- | --------------------------------------------------- |
| Parse structured input, inspect local state, or apply deterministic policy | `command`  | Synchronous when it must control the current action |
| Call a tool on an already-connected MCP server                             | `mcp_tool` | Always synchronous                                  |
| Slow telemetry or advisory work that must not delay the action             | `command`  | `async: true`                                       |

Do not use background commands or fallible MCP availability as an enforcement boundary.

## Command contract

Codex starts the configured command with the session `cwd`, writes one event JSON object to stdin,
and interprets stdout/stderr/exit according to the event. Read [input and output
contracts](input-output-contracts.md) plus the selected event reference before writing code.

Dependency-free Python starting point:

```python
#!/usr/bin/env python3
"""Example structure; replace the policy before activation."""

from __future__ import annotations

import json
import sys


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        print("invalid hook input", file=sys.stderr)
        return 2
    if not isinstance(event, dict):
        print("hook input must be an object", file=sys.stderr)
        return 2
    # Validate event-specific fields, apply the approved policy, and emit only
    # the event's documented output shape.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

For non-trivial Bash orchestration, use the target repository's conventions. A safe shell envelope
does not replace JSON validation:

```bash
#!/usr/bin/env bash
set -euo pipefail

payload=$(</dev/stdin)
# Parse with a dependency already required by the target environment; do not
# scrape JSON with regex or silently require an unavailable tool.
```

Keep stdout reserved for the documented hook result. Send bounded diagnostics to stderr and never
echo credentials or the full untrusted payload.

## Concurrent command handlers

Multiple matching command hooks for the same event are launched concurrently. One cannot prevent
another from starting. If one policy depends on another result, consolidate them into one handler or
move coordination behind a single service. Account for cumulative time, context, logging, and
conflicting decisions across all matching sources.

## MCP tool hooks

MCP hooks call a tool on an existing connection:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "mcp_tool",
            "server": "scanner",
            "tool": "scan_patch",
            "input": {
              "patch": "${tool_input.command}"
            },
            "timeout": 30,
            "statusMessage": "Scanning edited files"
          }
        ]
      }
    ]
  }
}
```

Required facts:

- `server` and `tool` must name an already-connected MCP capability.
- `input` is optional and defaults to `{}`.
- MCP hooks do not start or reconnect a server.
- They run synchronously, do not request tool approval, and do not trigger other hooks.
- `SessionStart` can occur before an MCP server is ready.
- `SessionEnd` does not support MCP handlers.
- Errors, missing servers, and unavailable tools do not block the triggering operation.
- A returned blocking decision can affect the operation only where that event supports it.

## `${field.nested}` expansion

Codex expands placeholders recursively through MCP input objects and arrays. A placeholder occupying
the entire JSON value preserves the original type. A placeholder embedded in a longer string becomes
text.

Given:

```json
{
  "tool_input": {
    "file_path": "src/main.rs",
    "count": 3
  }
}
```

This template:

```json
{
  "path": "${tool_input.file_path}",
  "count": "${tool_input.count}",
  "message": "Scanning ${tool_input.file_path}"
}
```

produces a string path, numeric count, and rendered message. Verify every referenced field exists for
the selected event; do not assume all tool inputs share a shape.

## Background command hooks

Set `"async": true` in JSON or `async = true` in TOML. The hook receives the same input, matcher,
trust review, timeout, and large-output handling as a synchronous command.

```toml
[[hooks.PostToolUse]]
matcher = "^Bash$"

[[hooks.PostToolUse.hooks]]
type = "command"
command = "python3 /absolute/path/post_tool_telemetry.py"
async = true
timeout = 120
```

When it finishes:

- during a turn, informational output becomes available at the next safe model request after current
  model/tool work;
- while idle, output waits for the next user turn;
- completion never starts a new turn.

Background hooks cannot block, approve, rewrite, reject a prompt, or continue the operation that
triggered them. Use synchronous execution for those controls.

Current documented limits:

- at most eight background hooks run concurrently per session; later invocations wait;
- invocations are independent and may finish out of order;
- session end cancels unfinished background hooks and discards undelivered output;
- `Interrupt` still has its 1-second default and 3-second maximum;
- `SessionEnd` remains synchronous.

After selecting execution, read the event-family reference to confirm what that event accepts.
