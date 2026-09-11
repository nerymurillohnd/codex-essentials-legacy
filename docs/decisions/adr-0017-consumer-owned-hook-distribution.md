---
status: accepted
date: 2026-09-10
decision-makers: Nery Samuel Murillo
---

# Distribute hook guidance, not active hooks

## Context

Marketplace plugins may need to help users configure Codex lifecycle hooks.
Automatic hook installation couples plugin installation to consumer project or
user configuration, bypasses environment assessment, and removes the user's
control over scope and trust.

## Decision

Plugins distribute skills, references, templates, tests, and rollback guidance
for consumer-owned hooks. Installation must not create, register, enable,
trust, or execute a hook.

When a user requests hook behavior, the relevant skill first assesses the
environment, existing sources, scope, configuration, runtime, and compatibility.
It presents exact consumer-owned files and wiring, obtains explicit approval,
then makes only approved writes. The user reviews and trusts non-managed hooks
in `/hooks`.

For Ruff After Edit, `PostToolUse` and `Stop` are one required pair after hook
installation is approved. `pre-commit` remains a separate, approval-gated
commit-time layer. Consumer handlers use Bash or Python unless the user
explicitly approves another runtime.

## Consequences

- Plugins remain inert at installation time.
- Skills carry the assessment and proposal responsibility.
- Users retain ownership, review, trust, and rollback control.
- A future active-plugin-hook exception requires explicit authorization and
  documentation of scope, trust, side effects, compatibility, and recovery.

## Confirmation

Review plugin manifests for the absence of a `hooks` component and package
`hooks/` directory. Verify affected skills document approval, consumer-owned
paths, `/hooks` trust, and rollback before release.

## Related records

- [Plugin package policy](../../plugins/AGENTS.md)
