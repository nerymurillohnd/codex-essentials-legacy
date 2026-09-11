# Repo Hygiene

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[Back to Codex Essentials](../../README.md)

> Turn Git audit evidence into understandable, approval-ready recommendations.

**Explore:** [Quick start](#quick-start) · [Purpose](#purpose) ·
[Boundaries](#behavior-and-boundaries) · [Verification](#verification) ·
[Support](#documentation-and-support)

Repo Hygiene is a Codex plugin for people who need to understand Git repository
cleanup, integration, recovery, topology, or regression decisions before
allowing a change. It produces a plain-language audit report and numbered
recommendations; it does not perform cleanup, pruning, integration, history
rewrites, remote mutation, or bisection until the user approves specific
recommendation IDs.

The plugin version is recorded in `.codex-plugin/plugin.json`. Install the
package from the repository's `main` catalog.

> [!CAUTION]
> An approval such as “clean it up” is not permission for destructive Git work.
> The user must approve the exact recommendation IDs after reviewing evidence,
> targets, risks, and recovery paths.

## Quick start

Add the marketplace and install the plugin:

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add repo-hygiene@codex-essentials
codex plugin list
```

For everyday local cleanup candidates:

```text
Use $repo-hygiene:routine to audit this checkout and present cleanup recommendations for my approval.
```

For divergent branches, recovery, worktrees, refs, or object-store questions:

```text
Use $repo-hygiene:deep to audit Git topology and present recommendations for my approval.
```

For a reproducible regression, code search, or line-history investigation:

```text
Use $repo-hygiene:debug to investigate this reproducible regression and present findings for my approval.
```

## Use cases

| Scenario                                              | How the plugin helps                                                                     | Expected result                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| A failed build left caches, logs, or ignored output.  | Audits one checkout, classifies candidates, and explains what is safe to consider.       | A bounded cleanup plan without file deletion.                    |
| A local branch may be stale or integrated.            | Proves local containment where possible and explains its limits.                         | A branch recommendation or a deep-audit escalation.              |
| Branches diverged or a recovery path is uncertain.    | Inspects revisions, topology, worktrees, reflogs, and objects under explicit invocation. | An evidence-led integration or preservation plan.                |
| A regression is reproducible between known revisions. | Searches tracked code, attributes lines, or isolates the first changed commit.           | A diagnostic finding and a separately approved remediation plan. |

**Not a fit when:** the user wants an unreviewed destructive cleanup, an
automatic force push, or a replacement for the repository's own access controls.

## Purpose

- Make repository state and risk understandable before any Git mutation.
- Separate routine checkout hygiene from topology, recovery, and forensic work.
- Keep the user in control of cleanup, pruning, integration, and recovery.

## Included Components

| Component                                                                | Purpose                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| [Plugin manifest](.codex-plugin/plugin.json)                             | Identity, capabilities, and bundled skill declaration.   |
| [Routine skill](skills/routine/SKILL.md)                                 | Automatically discoverable local hygiene audit.          |
| [Routine guidance](skills/routine/references/routine-hygiene.md)         | Candidate and local-branch evidence rules.               |
| [Deep skill](skills/deep/SKILL.md)                                       | Explicit topology, recovery, and high-risk audit.        |
| [Debug skill](skills/debug/SKILL.md)                                     | Explicit regression, attribution, and code-search audit. |
| [Debug guidance](skills/debug/references/debugging-with-git.md)          | `grep`, `blame`, and `bisect` decision and safety rules. |
| [Revision guidance](skills/deep/references/revisions-and-integration.md) | Revision proof and integration decision rules.           |
| [Recovery guidance](skills/deep/references/topology-and-recovery.md)     | Worktree, stash, remote, and reflog procedures.          |
| [Object guidance](skills/deep/references/object-store-and-provenance.md) | Ref, pack, configuration, and provenance inspection.     |
| [Changelog](CHANGELOG.md)                                                | User-facing package history.                             |
| [License](LICENSE.md)                                                    | MIT terms.                                               |

## Supported Environments

| Requirement   | Supported behavior                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Codex surface | Hosts that support installed Codex skills and explicit skill invocation.                               |
| Runtime/tools | Git executable and read access to the target checkout.                                                 |
| Project types | Git repositories; deep findings may also depend on provider access.                                    |
| Credentials   | None for local inspection; existing user-authorized authentication only for remote or provider checks. |
| Network       | Not used for routine local audits; optional and separately authorized for remote verification.         |
| Last verified | 2026-09-11 against the package manifest, skills, and marketplace contract.                             |

Current repository configuration, Git version, hosting provider policy, and
user authorization take precedence over this package's general guidance.

## Behavior and boundaries

## Inputs and Outputs

**Inputs:** a repository path and a stated audit, cleanup, integration,
recovery, topology, or reproducible-regression objective. Optional inputs
include the intended base branch, known-good and known-bad revisions, test
command, allowed parent directories, provider context, and risk tolerance.

**Outputs:** a plain-language summary, audit scope and limitations, classified
findings, preserved or uncertain items, and a numbered recommendation plan. On
approval, outputs also include execution evidence, verification, and residual
risk.

## Required Tools and Credentials

Git is required. The plugin does not require credentials. Remote or provider
inspection may use only authentication already available and authorized for the
specific request; credential values are never reported.

## Permissions

| Access or effect | What the plugin may do                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Read             | Inspect Git metadata, repository files, configuration provenance, and user-authorized provider state. |
| Write            | None during audit; only exact approved recommendation targets during execution.                       |
| Process          | Run Git inspection commands and project verification commands within the approved scope.              |
| Network          | None for routine work; read-only remote verification only with separate authorization.                |
| Authentication   | Reuse only existing, user-authorized credentials; never expose their values.                          |

## Side Effects

Installation changes Codex-managed plugin state only. Audits are read-only.
Approved execution can modify only the explicitly approved Git refs, files,
branches, worktrees, or remote targets and is revalidated immediately before
each action.

## Human Approval Boundaries

All skills audit first and present recommendation IDs. The user must approve
specific IDs, for example `Approve R1 and R3; retain R2`. Generic approval does
not authorize `git gc`, `git prune`, ref deletion, history rewrite, force push,
remote mutation, bisection, or deletion of uncertain recovery evidence.

## Installation Behavior

Installation adds `repo-hygiene:routine`, `repo-hygiene:deep`, and
`repo-hygiene:debug` to Codex. It does not modify the target project, initialize
Git, enable hooks, install dependencies, or configure credentials.

## Uninstall and Rollback Behavior

Refresh the marketplace when needed:

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
```

Remove only this plugin:

```bash
codex plugin remove repo-hygiene@codex-essentials
```

Uninstalling removes Codex-managed plugin state. It does not reverse any
previously approved Git operation; use the target repository's documented
recovery path, backups, tags, branches, reflogs, or provider history.

## Verification

Maintainers run:

```bash
npm run marketplace:build
npm run marketplace:check
npm run check
```

Consumer smoke test: invoke either skill, confirm that it reports findings and
recommendations without mutation, approve one safe item explicitly, then review
the resulting verification report.

## Known Limitations

- A routine audit cannot prove remote or provider-side squash/rebase equivalence.
- Deep findings depend on accessible repositories, worktrees, reflogs, provider
  state, and user-authorized credentials.
- Debugging findings depend on a reproducible classification method and may be
  inconclusive when historical revisions cannot be tested.
- Git evidence can preserve recovery candidates but cannot prove an unobserved
  external clone or backup does not exist.

## Failure and Recovery

If a target, authority, provenance, or recovery value is uncertain, the plugin
preserves it and reports the limitation instead of proposing deletion. If a
precondition changes after approval, execution stops and returns an updated
recommendation plan. Use the target repository's Git recovery mechanisms rather
than bypassing hooks or protections.

## FAQ

<details>
<summary>Does installing Repo Hygiene modify my repository?</summary>

No. Installation affects Codex-managed plugin state only. Repository changes
require an audit, a numbered recommendation, and approval of exact item IDs.
</details>

<details>
<summary>Can it delete files or branches automatically?</summary>

No. It can identify candidates and explain them, but it preserves uncertain
items and waits for specific approval before executing any recommendation.
</details>

<details>
<summary>When should I use the deep skill?</summary>

Use `$repo-hygiene:deep` for remotes, PR topology, divergent history,
integration decisions, worktrees, reflogs, hidden refs, object stores, or
recovery evidence.
</details>

<details>
<summary>When should I use the debug skill?</summary>

Use `$repo-hygiene:debug` for a reproducible regression, a tracked-code search,
line attribution, or a known-good/known-bad history range. Starting a bisection
or automated test loop still requires approval of a recommendation ID.
</details>

## Documentation and support

- [Routine skill](skills/routine/SKILL.md)
- [Deep skill](skills/deep/SKILL.md)
- [Debug skill](skills/debug/SKILL.md)
- [Official Git Cheat Sheet](https://git-scm.com/cheat-sheet)
- [Official Git command reference](https://git-scm.com/docs/git)
- [Official Git revisions reference](https://git-scm.com/docs/gitrevisions)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## License

MIT. See [LICENSE.md](LICENSE.md).

Repo Hygiene is an independent community plugin and is not affiliated with or
endorsed by Git or OpenAI.
