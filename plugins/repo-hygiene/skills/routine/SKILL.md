---
name: routine
description: Use when routine Git cleanup, ignored build-output review, local cache cleanup, or merged-branch housekeeping is requested.
metadata:
  short-description: Routine, bounded Git repository housekeeping
---

# Repo Hygiene

Keep this everyday mode local to one checkout and proportional to the request.
First capture the working tree, index, ignored inventory, and project cleanup
contract. Read [routine hygiene](references/routine-hygiene.md) before
classifying paths or local branches.

Classify each candidate as generated, ignored, tracked, configuration, secret,
cache, or user data. Report its path, size, classification, and ignore rule;
never print ignored-file contents.

## User-Facing Audit Report

Write the report before asking for approval. Lead with a plain-language summary:
what was audited, whether immediate risk was found, what matters most, and what
will remain unchanged without approval. Explain Git terms at first use; use raw
commands or object IDs only as supporting evidence, never as the conclusion.

### Evidence and scope

State the checkout and base branch inspected, the evidence collected, what was
not inspected, and any limitation that prevents a conclusion. Do not expose
ignored-file contents, credentials, or sensitive configuration values.

### Findings

For each material finding, give it a stable ID and explain in natural language:
what it is, why it is present, its practical effect, evidence supporting it,
confidence, and what could happen if left alone. Separate safe observations,
items retained for safety, and uncertain items that need a deeper audit.

### Recommendations awaiting approval

For every proposed action, provide its ID, intended outcome, exact target,
plain-language consequence, technical action, risk, reversibility or recovery,
and why the evidence supports it. End with a concise approval request such as
“Approve R1 and R3; retain R2.” Never ask the user to infer intent from a raw
command list.

## Recommendation Gate

Complete the audit before any mutation. Produce a numbered recommendation plan;
each item needs an ID, finding, evidence, exact proposed target and command,
risk, reversibility, and reason it is safe. State retained and uncertain items
separately. Do not treat “clean it up” as approval of the plan.

## Approved Execution

Act only after the user approves specific item IDs. Re-run the relevant
inventory immediately before each approved action; stop if its target, evidence,
or scope changed. Execute only approved item IDs, then report the command,
result, user-visible effect, remaining candidates, and uncertainty. A rejected
or omitted item stays unchanged.

Do not determine remote authority, PR history, squash/rebase equivalence,
multiple worktrees or clones, hidden refs, reflogs, unreachable objects, hooks,
or object storage. Ask the user to invoke `$repo-hygiene:deep` for those
surfaces.

`git clean -ndX` is allowed only as an ignored-file dry-run. Never use `-x`,
`-f`, `git gc`, `git prune`, worktree, remote, or stash deletion here. Treat
`.env*`, lockfiles, unclassified ignored files, and user data as retained.
