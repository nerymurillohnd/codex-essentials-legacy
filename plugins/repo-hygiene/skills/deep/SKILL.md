---
name: deep
description: Use when explicitly invoked as $repo-hygiene:deep for comprehensive Git topology, recovery, security, or object-store audits.
metadata:
  short-description: Explicit full-scope Git topology and recovery audit
---

# Deep Repo Hygiene

This explicit mode establishes an evidence-backed topology: active checkout,
remote authority, preservation paths, and unresolved work are separate.

Start read-only. Capture root, Git/common directories, remotes, status, all
branches, worktrees, and stashes. Refresh and compare remote heads only with
authorization. For provider PR state, use the provider source of truth.

Classify every finding before mutation: authority, active work, recoverable
forensics, stale operational risk, or deletion candidate. Treat provider and
tool refs, unreachable objects, lost-found data, separate clones, and closed
unmerged PRs as preserved evidence until their provenance is established.

## User-Facing Audit Report

Write the report before asking for approval. Lead with a plain-language summary:
what was audited, the authoritative state that was established or remains
unknown, the most important risks, and what will remain preserved without
approval. Translate topology, revision, and object-store terms before using
their technical names; commands and object IDs are evidence, not the narrative.

### Evidence and scope

State every checkout, remote, provider, revision, and time boundary inspected.
State inaccessible, unauthenticated, or intentionally excluded surfaces and the
effect of each limitation. Redact credentials, private remote URLs, and
sensitive configuration values.

### Findings

For each material finding, give it a stable ID and explain in natural language:
what it is, why it matters, the supporting evidence, confidence, recovery value,
and consequence of doing nothing. Keep active work, preserved forensics,
operational debt, and uncertain provenance visibly separate.

### Recommendations awaiting approval

For every proposed action, provide its ID, intended outcome, exact refs, paths,
or commits, preconditions, plain-language consequence, technical action, risk,
reversibility or recovery path, and required approval. End with a concise
approval request such as “Approve D2 and D4; retain D3.” Never require the user
to infer a destructive effect from a command or a Git term.

## Recommendation Gate

Complete a read-only audit before proposing any change. Produce a numbered
recommendation plan; each item needs an ID, finding, evidence, exact target and
command, authority and dependency checks, risk, reversibility, recovery path,
and required approval. Separate no-action findings, retained evidence, and
uncertain items. Do not infer permission from a general request to clean,
repair, consolidate, or synchronize.

## Approved Execution

Act only on approved item IDs. Revalidate the target, topology, worktree state,
and recovery path immediately before each action; stop on drift or ambiguity.
Execute no dependent item whose prerequisite was rejected or changed. Report
the exact command, user-visible result, resulting refs or paths, verification
evidence, preserved recovery paths, and residual risk.

For divergent branches, read [revisions and integration](references/revisions-and-integration.md).
For worktrees, stashes, remotes, and recovery, read
[topology and recovery](references/topology-and-recovery.md). For packed refs,
object provenance, and plumbing, read
[object store and provenance](references/object-store-and-provenance.md).

Prefer tags, archive branches, and archive paths to deletion. Never prune Git
objects, remove trace refs, delete a clone with unique commits, mutate remotes,
or integrate work without exact approval of its item ID. A generic approval
never authorizes `gc`, `prune`, ref deletion, history rewrite, force push, or
remote mutation. After authorized work, verify final refs, worktrees, stashes,
provider state, project gates, and any dry-run push.

Report evidence, classification, actions, preserved items, and residual
uncertainty. The old single reference is intentionally replaced by the three
decision-specific references above; do not load unrelated procedures.
