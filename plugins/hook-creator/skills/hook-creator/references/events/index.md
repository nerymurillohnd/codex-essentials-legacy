# Event Index

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck current event names, matcher targets, and output support before implementation.

Read this index first when selecting a lifecycle event. Then open exactly one linked family for each
distinct operational objective.

| Event               | When                                                        | Matcher target | Primary effect                                     | Family                                    |
| ------------------- | ----------------------------------------------------------- | -------------- | -------------------------------------------------- | ----------------------------------------- |
| `SessionStart`      | Main session starts/resumes/clears or resumes after compact | `source`       | Add startup context or stop the next model request | [Session](session-lifecycle.md)           |
| `SessionEnd`        | Main session ends                                           | `reason`       | Short advisory persistence/cleanup                 | [Session](session-lifecycle.md)           |
| `SubagentStart`     | Subagent starts                                             | `agent_type`   | Add subagent context or observe start              | [Subagent](subagent-lifecycle.md)         |
| `SubagentStop`      | Subagent is about to stop                                   | `agent_type`   | Request bounded continuation                       | [Subagent](subagent-lifecycle.md)         |
| `PreToolUse`        | Before a supported local tool                               | tool name      | Deny, rewrite, or add pre-tool context             | [Tool](tool-lifecycle.md)                 |
| `PermissionRequest` | Before Codex surfaces a required approval                   | tool name      | Allow, deny, or defer approval                     | [Tool](tool-lifecycle.md)                 |
| `PostToolUse`       | After a supported local tool returns                        | tool name      | Replace/shape feedback after effects               | [Tool](tool-lifecycle.md)                 |
| `PreCompact`        | Before compaction                                           | `trigger`      | Stop or annotate before compacting                 | [Compaction](compaction-lifecycle.md)     |
| `PostCompact`       | After compaction                                            | `trigger`      | Stop or annotate after compacting                  | [Compaction](compaction-lifecycle.md)     |
| `UserPromptSubmit`  | Before a submitted prompt reaches the model                 | ignored        | Add context or reject prompt                       | [Prompt/turn](prompt-and-turn-control.md) |
| `Stop`              | Root turn is about to stop                                  | ignored        | Request bounded root continuation                  | [Prompt/turn](prompt-and-turn-control.md) |
| `Interrupt`         | User interrupts an active main turn                         | ignored        | Short advisory logging/cleanup                     | [Prompt/turn](prompt-and-turn-control.md) |

## Select by objective

- Prevent or rewrite a supported local tool call → synchronous `PreToolUse`.
- Decide a prompt that Codex is already asking the user to approve → `PermissionRequest`.
- Inspect a result or guide the model after the tool ran → `PostToolUse`.
- Reject or enrich the user's prompt before model work → `UserPromptSubmit`.
- Provide context when a session or subagent begins → `SessionStart` or `SubagentStart`.
- Continue a root or subagent flow after it attempts to stop → `Stop` or `SubagentStop`.
- Intervene in compaction → `PreCompact` or `PostCompact`, depending required timing.
- Record a user interruption → `Interrupt`; it cannot prevent or reverse the interruption.
- Persist at session end → `SessionEnd`; it is short, synchronous, advisory, and main-thread only.

## Reject common mismatches

- Do not choose `PostToolUse` when the effect must be prevented.
- Do not choose `PermissionRequest` for calls that never require approval.
- Do not configure background execution for a decision that must control the triggering operation.
- Do not use ignored matchers on `UserPromptSubmit`, `Stop`, or `Interrupt`.
- Do not confuse `decision: "block"` at `Stop` with denying a tool; it requests continuation.
- Do not treat `SubagentStart`/`SubagentStop` as installing a hook inside a subagent.

After selecting the event, also load [input/output contracts](../input-output-contracts.md). Load
[handlers](../handlers-command-mcp-background.md) only when implementing the handler.
