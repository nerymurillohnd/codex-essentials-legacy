# Testing and Debugging

> Official sources: [Hooks](https://learn.chatgpt.com/docs/hooks),
> [Developer commands](https://learn.chatgpt.com/docs/developer-commands), and
> [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode).
> Last verified: 2026-09-07.
> Recheck CLI diagnostics, trust controls, and event behavior in the target release.

Read this reference to validate, review, or debug a hook. Work from the lowest unproven layer upward;
do not restart from random edits.

## Evidence ladder

| Level            | Proves                                                       | Does not prove                             |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------ |
| Parse            | JSON/TOML and handler source parse                           | Correct lifecycle semantics                |
| Structure        | Event → matcher group → handler has the expected shape       | Handler behavior or discovery              |
| Static semantics | Fields agree with published event contracts                  | Runtime availability or trust              |
| Handler contract | Fixture produces expected stdout/stderr/exit/timeout         | Codex loaded the hook                      |
| Behavioral       | Positive, negative, malformed, error, and timeout cases work | Other hooks do not interfere               |
| Discovery        | Codex lists exact source/definition                          | Current hash is trusted                    |
| Trust            | Current definition is trusted or awaiting review             | Matcher will fire in a real turn           |
| Integration      | Real event runs and coexists as designed                     | Universal coverage outside tested surfaces |

Report `PASS`, `FAIL`, `NOT_VERIFIED`, or `N/A` for every applicable level.

## Isolated command testing

Create synthetic event fixtures matching the complete documented shape. Run from the target
repository root and capture channels separately:

```bash
python3 .codex/hooks/pre_tool_use.py \
  < tests/fixtures/pre-tool-allow.json \
  > /tmp/hook.stdout \
  2> /tmp/hook.stderr
status=$?
```

Before using this pattern, resolve paths, confirm `/tmp` is acceptable on the OS, and ensure captured
files cannot contain real secrets. Inspect:

- exact exit code;
- whether stdout is empty or one valid event-specific result;
- whether stderr contains only bounded diagnostics;
- timeout and child-process cleanup;
- output under repeated/concurrent invocation;
- no writes outside the approved destination.

For enforcement, test allowed, denied, malformed input, missing required fields, handler failure, and
timeout. The malformed case must not silently become an allow when the objective requires fail-safe
behavior.

## Runtime verification

1. Run `codex doctor --json` and record hook/config warnings without exposing secrets.
2. Start Codex from the intended `cwd` and config/profile.
3. Open `/hooks` and confirm source, event, matcher, handler, enabled state, and trust hash.
4. Let the user review/trust the exact definition.
5. Trigger one real matching event and one nearby non-matching event.
6. Inspect Codex output, handler artifacts, exit status, timeout, and duplicate executions.
7. Change nothing else; repeat the negative case that the policy should reject.
8. For code-mode coverage, trigger the nested path separately.
9. For CI, use [CI/CD and GitHub Actions](ci-cd-and-github-actions.md) and keep remote evidence
   separate.

## Causal debugging sequence

1. Confirm `[features].hooks` is enabled and managed policy permits the source.
2. Confirm the intended configuration layer and JSON/TOML representation.
3. Confirm Codex discovers the exact definition.
4. Confirm the current hash's trust state.
5. Confirm the lifecycle event actually occurs on the target surface.
6. Confirm the matcher is supported and matches the actual field/value.
7. Capture a safe representation of the real stdin shape without retaining secrets.
8. Reproduce the handler in isolation with a synthetic equivalent fixture.
9. Inspect exit code, stdout, stderr, duration, timeout, and child processes.
10. Validate output against that event's published contract.
11. Inventory other matching hooks and concurrency/precedence.
12. Reproduce inside Codex from the intended cwd/profile.
13. Fix the first disproven layer, not a downstream symptom.
14. Repeat isolated positive/negative tests and real integration.

## Review checklist

Check at minimum:

- wrong event for the objective;
- matcher ignored or regex/alias misunderstood;
- async used as enforcement;
- `PostToolUse` treated as rollback;
- unsupported output fields;
- plain text where JSON is required;
- incompatible `updatedInput`;
- MCP hook treated as an infallible boundary;
- unstable relative paths;
- duplicate hooks across config layers;
- discovery/trust omitted;
- secrets in stdout, stderr, logs, context, or spill files;
- dependency on unstable transcript format;
- excessive additional context;
- unsafe/default-long/impossible timeout;
- unbounded `Stop`/`SubagentStop` continuation;
- universal coverage assumptions;
- code-mode behavior not tested;
- Windows/macOS/Linux mismatch;
- use of repository `main` behavior not confirmed in published docs.

For each finding record location, evidence, operational impact, exact correction, and how the
correction will be verified. A review-only request does not authorize edits.

## Completion report

Include:

- objective, selected event/matcher/handler/placement/execution;
- files created, changed, and preserved;
- evidence ladder with commands/observations;
- existing-hook composition and conflicts;
- sensitive inputs/outputs, path safety, timeouts, and coverage gaps;
- activation, trust, reload/restart, disable, and rollback actions;
- every unverified runtime or external claim.
