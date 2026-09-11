# Debugging with Git

Select the narrowest route that can answer the user's question. All three routes
produce evidence; none authorizes a code fix, history rewrite, or cleanup.

## Search: `git grep`

Use Git-aware search when the question is “where is this identifier, message, or
pattern in tracked content?” Scope the pathspec and pattern before running it.

```sh
git grep -n --full-name -e '<pattern>' -- <pathspec>
git grep -n --full-name -e '<pattern>' <revision> -- <pathspec>
```

Explain whether the result is the current checkout or a named revision. Search
results establish text presence, not causality or ownership. Avoid broad
patterns that could disclose secrets; redact sensitive matching lines in the
user-facing report.

## Attribution: `git blame`

Use line attribution when the relevant file and lines are known. Limit the
range, inspect the cited commit, and describe the result as “last modified,” not
as proof of fault or intent.

```sh
git blame -L <start>,<end> -- <path>
git show --no-patch --format=fuller <commit>
```

Use `git blame -C` only when copied or moved code is materially relevant and
state that it asks Git to trace origin across files. Follow a blame result with
the commit's diff and context before recommending any action.

## Regression isolation: `git bisect`

Use bisection only when the property can be classified consistently across
revisions. Confirm a known bad/new endpoint, a known good/old endpoint, the
test or reproduction rule, a safe checkout strategy, and the reset plan first.

`git bisect start` normally checks out intermediate commits. Treat it as a
user-approved state change. `--no-checkout` is appropriate only when the test
does not require a checked-out worktree.

```sh
git bisect start <bad> <good> --
# Mark exactly one result after testing: git bisect good, git bisect bad, or git bisect skip
git bisect log
git bisect reset
```

Use `old` and `new` terms for a property that is not naturally good or bad. A
skipped revision can leave more than one possible first commit; report that
ambiguity rather than inventing precision. `git bisect reset` restores the
pre-bisection checkout by default and is required at closeout.

## Automated Bisection

`git bisect run <cmd>` requires the user to approve the exact command and its
side effects. The command must return `0` for good/old, `1` through `127` for
bad/new except `125`, and `125` for an untestable revision. Other exit statuses
abort the process. Prefer test helpers outside the target repository when that
avoids interaction with historical revisions. Do not add a workaround patch,
run arbitrary project scripts, or use `reset --hard` as a bisection shortcut
without separate approval.

Sources: [git-bisect](https://git-scm.com/docs/git-bisect),
[Debugging with Git](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git),
and [git-grep](https://git-scm.com/docs/git-grep).
