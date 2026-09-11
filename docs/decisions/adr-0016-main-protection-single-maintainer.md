---
status: accepted
date: 2026-09-10
decision-makers: Nery Samuel Murillo
consulted: Codex
informed: Repository contributors
---

# Protect main with mandatory checks for a single maintainer

## Context

The marketplace is maintained through one GitHub account. Requiring a pull
request approval would require a distinct eligible account and would therefore
block every change without adding an independent review. The repository still
needs remote enforcement of its quality contract and protection against
destructive branch operations.

## Decision Drivers

- Keep the `main` quality and formatting checks mandatory before integration.
- Avoid an impossible approval requirement for the sole maintainer.
- Preserve remote controls that prevent accidental destructive operations.
- Validate staged shell and Python files before commits.

## Considered Options

- Require an approving pull-request review.
- Use mandatory checks and conversation resolution without a review count.
- Remove remote branch protection and rely on local hooks.

## Decision Outcome

Chosen option: "Mandatory checks without a required approval" because it
enforces independently executed GitHub Actions while remaining operable by the
repository's single maintainer.

The `main` branch requires up-to-date `Required quality gates` and `prettier`
checks and resolved conversations. Administrator enforcement, force-push
protection, and deletion protection remain enabled. No pull-request approval
count is required.

The local pre-commit contract validates staged executable shell files with
ShellCheck and shfmt, and staged Python files with Ruff 0.16.6 in isolated
mode. CI installs the corresponding tools and runs the same checks through
`npm run check`.

### Consequences

- Good, because every protected integration must satisfy the remote quality
  checks and be current with `main`.
- Good, because the sole maintainer can merge a passing pull request without a
  second GitHub account.
- Bad, because no independent human approval is available; review quality
  depends on the maintainer's review and automated checks.
- Bad, because direct documentation pushes permitted by repository policy may
  still require a GitHub bypass capability under branch protection.

### Confirmation

Verify the branch-protection API response, confirm the required workflow
contexts are successful on each pull request, run `npm run check`, and verify
the staged-file pre-commit tests. Reconsider this decision before adding a
second eligible maintainer or if repository governance requirements change.

## More Information

This decision supersedes the current branch-protection portion of the resolved
maintenance entry dated 2026-09-10 and supersedes the historical routing model
in [ADR-0009](adr-0009-direct-push-and-pr-routing.md). It does not change the
root repository policy that limits direct pushes to eligible documentation
records.
