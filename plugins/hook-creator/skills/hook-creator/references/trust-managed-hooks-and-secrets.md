# Trust, Managed Hooks, and Secrets

> Official sources: [Hooks](https://learn.chatgpt.com/docs/hooks),
> [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced), and
> [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action).
> Last verified: 2026-09-07.
> Recheck enterprise policy keys, trust UI, spill paths, and automation security controls.

Read this reference for `/hooks`, managed policy, trust bypass, credentials, transcripts, permissions,
or sensitive output.

## Trust model

Codex can list a hook definition before allowing it to run. Non-managed user/project/plugin hooks
must be reviewed and trusted for the exact current definition hash. A new or changed definition is
skipped until trusted. Installation or plugin enablement is not trust.

Use `/hooks` to:

- inspect sources and exact commands;
- review new or changed definitions;
- trust the current hash;
- disable individual non-managed hooks.

Do not automate the user's trust decision. When an implementation is ready, explain what to inspect
and leave the action to the user.

## Managed hooks

Administrators can define hooks in `requirements.toml` and deliver scripts through MDM or another
device-management system.

```toml
allow_managed_hooks_only = true

[features]
hooks = true

[hooks]
managed_dir = "/enterprise/hooks"
windows_managed_dir = 'C:\enterprise\hooks'

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "python3 /enterprise/hooks/pre_tool_use_policy.py"
command_windows = 'py -3 C:\enterprise\hooks\pre_tool_use_policy.py'
timeout = 30
statusMessage = "Checking managed Bash command"
```

- Pin `[features].hooks = true` when policy must keep managed hooks enabled.
- `allow_managed_hooks_only = true` skips user, project, session, and plugin hooks while retaining
  managed sources.
- `managed_dir` applies to macOS/Linux; `windows_managed_dir` applies to Windows.
- Codex does not distribute managed scripts. Enterprise tooling owns installation and updates.
- Commands should use absolute paths under the managed directory.
- Managed definitions are policy-trusted and cannot be disabled from the user hook browser.

Do not present a user/project hook as a substitute for an administrator-controlled policy.

## Bypass flag

`--dangerously-bypass-hook-trust` runs enabled hooks without persisted trust for one invocation. It
is intended only for automation that already vets hook sources. It is not a development shortcut and
does not prove the external vetting is adequate. State the review, provenance, runner isolation, and
residual risk before recommending it.

## Sensitive inputs

Hook events may expose prompts, commands, tool arguments/responses, working paths, model, permission
mode, last assistant messages, and transcript paths. A handler should consume only fields required by
its objective.

- Treat prompts, tool data, transcripts, and MCP results as untrusted.
- Do not depend on transcript format; it is explicitly unstable.
- Do not pass secrets into shell interpolation or MCP templates without a documented need.
- Refer to credentials by `${VAR}` name only; never print or persist resolved values.
- Keep fixtures synthetic and unmistakably non-secret.

## Sensitive outputs and spilling

Model-visible hook output above the normal limit may be written to a temporary spill file. Therefore:

- never echo matched credentials in a block reason;
- keep stdout to the event's minimal result;
- keep stderr concise and non-sensitive;
- do not copy full prompts, transcripts, tool responses, or environment dumps into context;
- bound logs and define retention/permissions;
- avoid `additionalContextLimit = 0` unless the producer enforces a strict safe cap;
- consider that plugin and multiple-hook context accumulates.

## Failure posture

Define failure from the actual objective:

- For a prevention control, confirm what Codex does on handler error, timeout, or malformed output;
  never assume every failure blocks.
- MCP server/tool absence does not block by default.
- Background hooks cannot enforce the triggering action.
- `SessionEnd`/`Interrupt` have short limits and cannot guarantee slow remote persistence.
- A hook is a guardrail, not a replacement for sandbox, approvals, managed permissions, branch
  protection, or external policy enforcement.

## Security review

Before activation, inspect source provenance, handler dependencies, subprocesses, network targets,
filesystem writes, symlink/path traversal, output retention, concurrency, timeout cleanup, replay/
idempotency, and rollback. Then review the exact hash in `/hooks` and exercise both intended and
prohibited behavior.
