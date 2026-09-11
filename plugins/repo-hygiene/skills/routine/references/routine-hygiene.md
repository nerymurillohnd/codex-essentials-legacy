# Routine Git Hygiene

Use this reference for local, reversible cleanup only. It is not evidence of
remote integration, PR state, squash equivalence, or safety in another worktree.

## Evidence Before Classification

```sh
git status --short --branch --ignored
git diff --name-status
git diff --cached --name-status
git ls-files --others --ignored --exclude-standard
git check-ignore -v -- <path>
git ls-files --error-unmatch -- <path>
```

Treat a `git check-ignore` result as the responsible ignore rule, not proof that
the path is disposable. `git ls-files --error-unmatch` distinguishes tracked
paths; a failing result does not by itself prove a path can be deleted. Do not
open ignored-file contents: report only path, class, rule, and size.

## Local Cleanup Decision

Use project-native cleanup only after inspecting its script or documentation.
When Git inventory is needed, `git clean -ndX` may preview ignored candidates.
It must remain a dry-run; do not use `-x`, which includes normally ignored local
configuration and potential secrets. A later deletion must name exact paths that
appeared in the final dry-run and have explicit user approval.

Retain `.env*`, lockfiles, unclassified ignored paths, user data, and any cache
whose rebuild cost or ownership is unknown.

## Local Branch Decision

Ask for the intended base when it is not explicit; do not guess it from a branch
name. Inspect with:

```sh
git branch --merged <base>
git merge-base --is-ancestor <branch> <base>
git branch --show-current
```

Ancestor containment does not prove a branch was integrated by squash, rebase,
or a provider-side PR operation. Escalate to deep mode for that question, any
remote or PR evidence, or more than one worktree. Never delete the current
branch; after containment and explicit approval, use only
`git branch -d <exact-branch>`, never `-D`.

Source: [Git Cheat Sheet](https://git-scm.com/cheat-sheet) and
[Git command reference](https://git-scm.com/docs/git).
