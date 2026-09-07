# Subagent Lifecycle

> Official sources: [Hooks](https://learn.chatgpt.com/docs/hooks) and
> [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
> Last verified: 2026-09-07.
> Recheck available `agent_type` values and custom-agent configuration in the target Codex release.

Read this reference for `SubagentStart`, `SubagentStop`, or hooks targeted to custom subagent roles.

## What is being targeted

Subagent hooks live in an ordinary user, project, plugin, or managed hook source. They observe or
control lifecycle points using `agent_type`; they are not installed inside the subagent. Custom agent
roles are configured separately under `[agents]` and may supply an `agent_type` value used by the
matcher.

## `SubagentStart`

- Runs when a subagent starts; it cannot prevent startup.
- `matcher` filters `agent_type`.
- Adds `turn_id`, `agent_id`, `agent_type`, and `permission_mode`.
- Uses the parent `session_id`.
- Plain stdout becomes extra developer context for that subagent.
- JSON accepts `systemMessage` and `hookSpecificOutput.additionalContext` with
  `hookEventName: "SubagentStart"`.
- `continue: false` is parsed for compatibility but does not stop the subagent.

Inactive reviewer-targeted example:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "^reviewer$",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /absolute/path/reviewer_context.py",
            "timeout": 10,
            "additionalContextLimit": 2000
          }
        ]
      }
    ]
  }
}
```

Context output:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Review the changed contract and run its negative case."
  }
}
```

## `SubagentStop`

- Runs when a subagent is about to stop.
- `matcher` filters `agent_type`.
- Adds `turn_id`, `agent_id`, `agent_type`, `agent_transcript_path`, `stop_hook_active`, and
  `last_assistant_message`.
- Exit 0 requires JSON; plain stdout is invalid.
- `decision: "block"` with a non-empty `reason` requests continuation.
- Exit 2 with a concise stderr reason is another documented continuation path.
- `continue: false` from any matching hook takes precedence over continuation decisions.

```json
{
  "decision": "block",
  "reason": "Run the missing negative verification before returning."
}
```

Check `stop_hook_active` before continuing. Design a finite rule—normally at most one continuation—
and test the already-active case so a subagent cannot loop indefinitely.

## Relationship to custom agents

Custom-agent configuration selects role instructions, model, reasoning, tools, and related settings.
Lifecycle hooks remain a separate configuration system. To target a role:

1. Verify the role's actual `agent_type` in the target environment.
2. Configure `SubagentStart` and/or `SubagentStop` in an active hook layer.
3. Match the verified `agent_type`.
4. Keep injected context compatible with the role's existing instructions.
5. Test the real spawn and stop path; a regex match on paper is not integration evidence.

Read [integration and bundling](../integration-and-bundling.md) before claiming hooks are “bundled to
an agent.”
