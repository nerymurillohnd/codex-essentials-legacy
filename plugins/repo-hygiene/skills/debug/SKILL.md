---
name: debug
description: Use when explicitly invoked as $repo-hygiene:debug to investigate a reproducible Git-tracked regression, code origin, or repository search result.
metadata:
  short-description: Explicit Git regression, attribution, and search audit
---

# Repo Hygiene Debug

Use this explicit mode to explain a reproducible symptom, locate relevant code,
attribute it to history, or isolate the first commit that changed a property.
It is not a general code-debugging skill and it never implements a fix.

Start read-only. Capture the symptom, reproduction or test command, expected and
actual result, target paths, known-good and known-bad revisions, current status,
and active worktrees. Read [debugging with Git](references/debugging-with-git.md)
for the route that fits the evidence.

## User-Facing Audit Report

Write the report before asking for approval. Lead with a plain-language summary:
what symptom was investigated, what Git can and cannot establish, the strongest
evidence, and what remains untested. Explain `grep`, `blame`, and `bisect` in
plain language before presenting commands or object IDs.

### Evidence and scope

State the checkout, revisions, paths, test command, and time boundary inspected.
State whether the result came from text search, line attribution, or bisection.
Redact credentials, private URLs, and sensitive search results.

### Findings

Give every material finding a stable ID. Explain the matching code, last known
line change, candidate range, or first bad commit; distinguish evidence from
inference and state confidence, skipped revisions, and limitations.

### Recommendations awaiting approval

For every proposed action, provide its ID, intended outcome, exact revisions or
paths, plain-language consequence, technical action, risk, reset or recovery
path, and required approval. A report may recommend a bisection, but starting
or automating it requires explicit approval because it can change the checkout.

## Recommendation Gate

Complete search and attribution before proposing mutation. Produce a numbered
recommendation plan and do not start a bisection until a known-good and
known-bad (or old/new) endpoint, a clean or explicitly isolated worktree, and
a reproducible classification method exist. Never infer a test command, run an
unreviewed script, or treat a build failure as evidence about the symptom
without the user's stated rule.

## Approved Execution

Execute only approved item IDs. Revalidate the worktree, endpoints, and test
method immediately before each action. For a bisection, record the starting
`HEAD`, preserve the session log, report each skipped or untestable revision,
and always run `git bisect reset` on completion or interruption unless the user
explicitly approves another final checkout. A first bad commit is a diagnostic
finding; remediation requires a separate approved recommendation.
