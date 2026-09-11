# Object Store and Provenance

Use this reference for hidden refs, object health, packfiles, alternates, or
configuration provenance. These commands inspect; none authorize repair.

```sh
git for-each-ref --format='%(refname) %(objecttype) %(objectname)' refs
git show-ref --head --dereference
git rev-parse --git-path packed-refs
git count-objects -vH
git fsck --full --strict --connectivity-only
git rev-list --objects --all
git rev-parse --git-path objects/info/alternates
```

Do not edit `packed-refs` manually. `for-each-ref` inventories logical refs; it
does not identify whether a ref is loose or packed. Treat `refs/pull/*`, notes,
replace refs, and tool refs as provenance until classified, not as ordinary
branches. An alternates file can make objects available from another object
store, so record it before reasoning about object ownership.

For a concrete pack index, `git verify-pack -v <index>` may validate pack
contents; use `git multi-pack-index verify` only when the command is available.
Do not run `gc`, `prune`, repack, or repair merely because size or fsck output
looks unusual. Preserve the evidence and request exact authorization after the
finding is explained.

Inspect configuration provenance with targeted, redacted queries. Do not print
raw configuration wholesale because remote URLs or credential helpers can carry
sensitive values. Review only the approved keys for includes, hooks paths,
worktree configuration, URL rewriting, filters, sparse checkout, LFS, and
submodules; mask any credential-bearing value immediately.

Source: [Git command reference](https://git-scm.com/docs/git).
