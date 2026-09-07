---
status: accepted
date: 2026-09-07
decision-makers: Nery Samuel Murillo
---

# Version plugins without distribution artifacts

## Decision

Use Release Please manifest mode to version each `plugins/<plugin-id>` package
independently. The manifest `version` remains the only authored version source.
Release Please creates reviewed release pull requests, immutable
`plugin/<plugin-id>/v<semver>` tags, and GitHub Release notes.

The workflow must not publish to a registry or upload archives, checksums, or
other release assets. GitHub's automatic source links remain a platform feature,
not a distribution artifact created by this repository.

## Routing

Plugin contract changes require a PR and a releasable Conventional Commit plus
an Unreleased changelog entry. Plugin editorial documentation and repository
controls require a PR but no version bump. Only plans, audits, and maintenance
records under `docs/` may be pushed directly, and only when they do not alter
policy, product contracts, public claims, or release history.

## Consequences

Users can inspect versioned plugin history without npm packages or repository
generated artifacts. A tag/release is created only after a reviewed release PR
merges; local validation cannot create remote state.
