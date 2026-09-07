# Prompt and Turn Control

> Official source: [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck stop/interrupt JSON requirements and continuation precedence.

Read this reference for `UserPromptSubmit`, `Stop`, or `Interrupt`.

## `UserPromptSubmit`

- Runs before the submitted prompt is sent to the model.
- Any configured matcher is ignored; filter the `prompt` inside a command handler.
- Adds `turn_id`, `prompt`, and `permission_mode`.
- Plain stdout becomes additional developer context.
- JSON supports common fields and `hookSpecificOutput.additionalContext` with
  `hookEventName: "UserPromptSubmit"`.
- Block the prompt with `decision: "block"` and a non-empty `reason`, or exit 2 with stderr.

```json
{
  "decision": "block",
  "reason": "Remove the credential and submit the prompt again."
}
```

Prompt scanning is not a complete DLP boundary. Avoid echoing the sensitive match through stdout,
stderr, logs, context, or test fixtures.

## `Stop`

- Runs when a root turn is about to stop.
- Matcher is ignored.
- Adds `turn_id`, `stop_hook_active`, and `last_assistant_message`.
- Exit 0 requires JSON; plain stdout is invalid.
- `decision: "block"` with `reason` requests continuation and creates a new continuation prompt.
- Exit 2 with stderr is another documented continuation path.
- `continue: false` from any matching Stop hook takes precedence over continuation decisions.

```json
{
  "decision": "block",
  "reason": "Run the missing verification and report its output."
}
```

Check `stop_hook_active`. Define a finite continuation rule and test the already-active path. Do not
turn every final response into another turn or override a user's request to stop.

## `Interrupt`

- Runs when the user interrupts an active main turn.
- Does not run for idle sessions or subagents.
- Matcher is ignored.
- Adds `turn_id` and `permission_mode`.
- Defaults to 1 second and supports at most 3 seconds, including background execution.
- Cannot prevent the interruption or restart the turn.
- Exit 0 with no output is valid; JSON may contain `systemMessage`.
- Plain stdout is invalid.

```json
{
  "systemMessage": "Saved the interruption marker to the local audit log."
}
```

Keep work short and idempotent. A message claiming that state was saved is valid only if the handler
confirmed the write; otherwise report the failure or omit the claim.
