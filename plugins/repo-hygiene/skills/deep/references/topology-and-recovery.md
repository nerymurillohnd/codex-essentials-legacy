# Topology and Recovery

Use this reference for worktrees, stashes, remotes, deleted tips, and recovery.
Collect a snapshot before any mutation:

```sh
git worktree list --porcelain
git stash list --date=iso-local
git reflog show --all --date=iso-local
git remote -v
git branch --all --verbose --no-abbrev
```

For every valid worktree path, inspect `git -C <path> status --short --branch`
and resolve its `HEAD`. Do not prune or remove a registration until inaccessible
paths, dirty worktrees, detached HEADs, and referenced branches are classified.
`git worktree prune --dry-run --verbose` is inventory; `prune` or `remove`
requires explicit approval of each path.

Inspect a stash with `git stash show --stat stash@{n}` before any drop. Resolve
recovery candidates with `git show <ref>@{n}` or
`git rev-parse '<ref>@{timestamp}'`; these forms require an existing local
reflog. `ORIG_HEAD`, `MERGE_HEAD`, `REBASE_HEAD`, `REVERT_HEAD`, and
`CHERRY_PICK_HEAD` are operation state, not interchangeable recovery points.

With authorization for network access, use `git fetch --prune origin` followed
by `git ls-remote --heads origin`; fetch updates local remote-tracking evidence
but does not establish provider PR state. For uncertain commits, inspect first:

```sh
git fsck --full --strict --unreachable --no-reflogs
git cat-file -t <oid>
git show --no-patch <oid>
```

`--no-reflogs` intentionally includes objects reachable only from reflogs; it
does not prove loss. Correlate objects to refs, reflogs, stashes, branches, and
bundles before calling them dangling. Create a recovery branch or tag only with
approval of its exact name and target; never recover implicitly with `reset` or
`update-ref`.

Source: [gitrevisions](https://git-scm.com/docs/gitrevisions) and
[Git command reference](https://git-scm.com/docs/git).
