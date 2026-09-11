# Revisions and Integration

Use this reference when a decision depends on commit identity, divergence, or
an integration strategy. Validate every user-supplied revision before using it:

```sh
git rev-parse --verify --end-of-options '<rev>^{commit}'
git show --no-patch --format=fuller <oid>
git merge-base <base> <topic>
git rev-list --left-right --count <base>...<topic>
git log --graph --decorate --oneline --boundary <base>...<topic>
git diff --stat <base>...<topic>
```

Record resolved object IDs for base, topic, merge base, and any old range. For
history walks, `A..B` selects commits reachable from `B` but not `A`; `A...B`
selects the symmetric difference. For `git diff`, triple-dot compares `B` with
the merge base of `A` and `B`; do not use it as a generic symmetric diff.

Use `HEAD`, `@{n}`, `@{<date>}`, `@{upstream}`, and `@{push}` only after
resolving them. Reflog selectors require local reflogs; upstream and push may
differ in a triangular workflow. Quote revision expressions so the shell does
not reinterpret their special characters.

## Strategy Decision

Choose and justify one strategy before mutation:

| Strategy    | Use only when                                                             | Guard                                                   |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Merge       | Shared history or topology must remain visible.                           | Inspect conflict risk; authorize the exact merge.       |
| Rebase      | Rewritten commits are private and rewriting is approved.                  | Preserve a recovery ref; never rewrite shared history.  |
| Squash      | One atomic integration is intentional and commit granularity may be lost. | Review the aggregate diff and authorize the new commit. |
| Cherry-pick | Explicitly selected commits, not a whole-branch substitute.               | Prove each selected commit and its dependency order.    |
| Revert      | A published change must be compensated without rewriting history.         | Review the inverse diff and authorize the revert.       |

Before merge, rebase, or squash, require a clean worktree and index and verify
the target is not checked out elsewhere. For a non-mutating three-way preview,
resolve `merge_base=$(git merge-base <base> <topic>)` and use
`git merge-tree "$merge_base" <base> <topic>`; do not substitute `<base>` for
the merge base. On a normal merge or rebase conflict, stop and use the matching
`git merge --abort` or `git rebase --abort`. A squash merge has no `MERGE_HEAD`:
do not run `git merge --abort`; instead create a separate approved recovery
recommendation after inspecting the conflicted index and worktree. For a
published rebase, record the reviewed remote OID and require explicit approval
for `git push --force-with-lease=<refname>:<expected-oid>`; never substitute
`--force` or an unpinned lease. Use `git range-diff <old-base>..<old-tip>
<new-base>..<new-tip>` to compare two patch-series versions, not to prove graph
containment.

Source: [gitrevisions](https://git-scm.com/docs/gitrevisions),
[Git Cheat Sheet](https://git-scm.com/cheat-sheet#combine-diverged-branches),
and [Git command reference](https://git-scm.com/docs/git).
