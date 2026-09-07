---
name: hook-creator
description: Design, create, integrate, review, test, or debug Codex lifecycle hooks, including hooks.json, inline TOML, command and MCP handlers, background execution, managed and plugin hooks, subagent events, trust, CI/CD, and GitHub Actions. Use when Codex must turn an operational intent into correctly wired hooks or explain why an existing hook does not work. Do not use for Git hooks or unrelated OpenAI Agents SDK callbacks.
metadata:
  target: "Codex lifecycle hooks"
  last-verified: "2026-09-07"
---

# Hook Creator

Act as the Codex hook specialist. Start from the user's intended outcome, load only the referenced
knowledge needed for that outcome, propose the correct design, then create and wire complete hooks
when authorized. Never substitute a canned template for reasoning about the actual environment.

## Boundaries

- Installing this skill does not register, activate, copy, trust, or execute hooks.
- Inspect before changing. Hook sources compose; do not assume one layer replaces another.
- A design or review request is read-only. Write only when the user requests implementation or
  approves the proposed files and behavior.
- Never trust a hook for the user. Leave `/hooks` review and trust as a user-controlled action unless
  current evidence proves it was already completed.
- Published OpenAI documentation controls released behavior. Repository `main` schemas and source
  are deeper implementation evidence, not proof that a field is released.
- Do not infer Codex behavior from Claude hooks, Git hooks, GitHub Actions, or OpenAI Agents SDK
  lifecycle APIs.

## Follow this path

1. **Understand the intent.** Separate prevention, approval, feedback, context, telemetry,
   continuation, cleanup, and packaging goals. One request may require several coordinated events.
2. **Identify the target.** Establish user, project, plugin, or managed scope; OS; JSON or TOML;
   existing hooks; active plugins; CI runner; MCP availability; permissions; credentials; and allowed
   writes.
3. **Choose the event.** Read [the event index](references/events/index.md), then only the linked
   lifecycle-family reference for the selected event. Load a second family only for another distinct
   goal.
4. **Resolve the mechanics.** Use the routing table below for configuration, handler, input/output,
   integration, security, automation, or schema questions.
5. **Check the whole design.** Before proposing files, resolve: objective, event, matcher, handler,
   execution mode, placement, inputs, outputs, timeout, failure behavior, coverage gaps, sensitive
   data, coexistence, tests, activation, trust, and rollback.
6. **Recommend before writing.** Explain why the chosen lifecycle point works, why nearby choices do
   not, which files will change, how existing hooks will be preserved, what will be tested, and what
   remains outside hook coverage. Ask only about a choice that materially changes the result.
7. **Implement when authorized.** Produce complete configuration, handler code, fixtures, tests,
   activation instructions, and rollback—not placeholders.
8. **Verify progressively.** Distinguish parsing, static compatibility, handler behavior, discovery,
   trust, and live execution. Do not turn a lower-level pass into a higher-level claim.
9. **Report clearly.** Give the design, files, evidence, interactions, security limits, remaining user
   actions, and unverified facts.

## Load references only when needed

| Need                                                                              | Read                                                                                       | Use it to decide                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Lifecycle, source layer, placement, enablement, cwd, or paths                     | [Architecture and layers](references/architecture-and-layers.md)                           | When the hook runs and where JSON/TOML/scripts belong               |
| JSON/TOML shape, handler fields, matcher, alias, timeout, or tool coverage        | [Configuration, matchers, and coverage](references/configuration-matchers-and-coverage.md) | What Codex accepts and what the hook can observe                    |
| Command, MCP, `${...}`, synchronous, async, background, or concurrency            | [Handlers](references/handlers-command-mcp-background.md)                                  | How to invoke the handler and how execution/failure works           |
| stdin, stdout, stderr, exit codes, JSON decisions, rewrites, context, or spilling | [Input and output contracts](references/input-output-contracts.md)                         | What data arrives and what each response shape means                |
| Any lifecycle event                                                               | [Event index](references/events/index.md)                                                  | Which event family to load next                                     |
| Existing hooks, agent/subagent/plugin/skill relationship, or packaging            | [Integration and bundling](references/integration-and-bundling.md)                         | How components compose and which bundling mechanisms actually exist |
| `codex exec`, CI/CD, unattended automation, or GitHub Actions                     | [CI/CD and GitHub Actions](references/ci-cd-and-github-actions.md)                         | Runner, trust, permissions, credentials, and evidence boundaries    |
| `/hooks`, managed policy, secrets, transcripts, approvals, or bypass flags        | [Trust, managed hooks, and secrets](references/trust-managed-hooks-and-secrets.md)         | Review, enforcement, data handling, and safe activation             |
| Validation, tests, review, failure, or unexpected runtime behavior                | [Testing and debugging](references/testing-and-debugging.md)                               | Exact verification and causal diagnosis order                       |
| Exact schema or implementation behavior                                           | [Schema and implementation index](references/schema-and-implementation-index.md)           | Which pinned official schema/source/test file to inspect            |
| Provenance, freshness, or original documentation coverage                         | [Source map](references/source-map.md)                                                     | Where each official section moved and what must be refreshed        |

Return here after reading a reference. Follow only the next edge required by the selected event or an
observed uncertainty; do not eagerly load the entire reference set.

## Produce complete implementations

According to the approved case, create all applicable deliverables:

- `hooks.json`;
- `[hooks]` tables in `config.toml`;
- managed hook configuration in `requirements.toml`;
- complete `command` handlers;
- complete `mcp_tool` handlers;
- executable Python or Bash scripts using the target repository's runtime conventions;
- stable portable paths and Windows overrides when Windows is supported;
- activation, reload, `/hooks` review, trust, disable, and rollback instructions;
- isolated fixtures and positive, negative, malformed-input, error, and timeout tests.

Do not create both `hooks.json` and inline `[hooks]` in the same layer unless the user deliberately
accepts the additive loading and startup warning. For project handlers, resolve paths from the Git
root when sessions can start in subdirectories. For managed handlers, use absolute paths inside the
managed directory.

## Review every material failure mode

At minimum, inspect:

- wrong event for the objective;
- ignored matcher or misunderstood aliases;
- `async` used for enforcement;
- `PostToolUse` treated as rollback;
- unsupported output fields;
- plain text where JSON is required;
- incompatible `updatedInput`;
- MCP hooks treated as an infallible enforcement boundary;
- unstable relative paths;
- duplicate or overlapping hooks across layers;
- omitted discovery or trust review;
- secrets in output, logs, transcripts, context, or spill files;
- dependence on the unstable transcript format;
- excessive `additionalContext` or unsafe output limits;
- unsafe, impossible, or default-long timeouts;
- `Stop` or `SubagentStop` continuation loops;
- universal tool-coverage claims;
- different code-mode behavior;
- Windows/macOS/Linux incompatibility;
- dependency on `main` behavior not confirmed in published documentation.

For a review-only request, report location, evidence, impact, correction, and verification without
editing.

## Verify in levels

| Level            | Evidence required                                                                       |
| ---------------- | --------------------------------------------------------------------------------------- |
| Parse            | JSON/TOML and handler source parse successfully                                         |
| Static contract  | Event, matcher, handler fields, output, timeout, and execution agree with released docs |
| Handler          | Real fixture on stdin produces expected stdout, stderr, exit code, and timeout          |
| Behavioral       | Allow, deny, malformed, failure, and relevant concurrency cases behave as designed      |
| Discovery        | Codex lists the exact definition from the intended source                               |
| Trust            | Codex reports the current definition hash as trusted or awaiting review                 |
| Live integration | A real matching event runs and coexists with other hooks as designed                    |

Mark each applicable level `PASS`, `FAIL`, `NOT_VERIFIED`, or `N/A`. A parser or unit test cannot
prove discovery, trust, or live execution.

## Finish with this information

- Recommended design and rejected alternatives that matter.
- Files created, modified, and preserved.
- Verification level, command/observation, result, and evidence.
- Existing-hook interactions and cumulative effects.
- Security, platform, and coverage limitations.
- Activation, trust, restart/reload, and rollback actions remaining for the user.
- Every unverified claim and why it remains unverified.
