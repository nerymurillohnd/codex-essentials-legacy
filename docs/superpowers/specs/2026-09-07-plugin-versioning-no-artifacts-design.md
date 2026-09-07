# Plugin Versioning Without Distribution Artifacts

## Status

Approved in conversation on 2026-09-07. This specification supersedes the
current no-release policy in `AGENTS.md` only after its implementation is
merged. It does not authorize a current tag, GitHub Release, package publish,
or other remote mutation.

## Purpose

Give each marketplace plugin an independently versioned, reviewable, and
durable release history without treating a Codex plugin as an npm package or
generating distribution archives.

## Scope

The design adds manifest-mode Release Please configuration for every
`plugins/<plugin-id>/` package, a minimal GitHub Actions workflow, local
contract validators and tests, and synchronized contributor and architecture
documentation.

The design does not publish to npm, create package manifests, upload release
assets, generate checksums or archives, install release tooling locally, or
alter a plugin's runtime behavior.

GitHub automatically exposes source ZIP and TAR links for a GitHub Release.
They are platform-provided snapshots of the tag, not uploaded plugin assets;
the workflow must not create or upload any files.

## Source of Truth and Lifecycle

`plugins/<plugin-id>/.codex-plugin/plugin.json` remains the only authored
version value. Every plugin keeps its own `CHANGELOG.md`, with an `Unreleased`
section and dated SemVer headings.

Release Please manifest mode maps one component to each `plugins/<plugin-id>`
directory. It considers only commits that change that directory, analyzes
Conventional Commits, and opens or updates a release pull request. The release
pull request updates the component's manifest version through the JSON updater,
rolls its changelog entry into a dated version heading, and records the new
version in the release manifest.

After that pull request merges, Release Please creates exactly one immutable tag
named `plugin/<plugin-id>/vX.Y.Z` and one GitHub Release with generated notes.
The workflow verifies that the released tag, manifest version, release record,
and changelog heading agree and that the GitHub Release has zero uploaded
assets. The existing repository tag ruleset remains the remote control that
rejects deletion and non-fast-forward updates.

## Bootstrap

The migration must not invent historical releases. The initial configuration
records the existing remote release baselines for Astro Commands and Prettier
After Edit, and explicitly seeds the other plugins at their manifest versions.
The first generated release pull request is reviewed like any other product
change before it can establish a missing baseline tag and release. It must not
retag an existing version or silently advance a manifest version.

## Controls

Local validation must reject:

- a manifest version that is not strict SemVer;
- a changed plugin without a non-empty `Unreleased` changelog section;
- a release configuration path that does not correspond exactly to one plugin;
- a release manifest/configuration version that disagrees with the plugin
  manifest where the state is expected to agree;
- a tag name that does not exactly match its plugin manifest version;
- workflow steps that publish packages, create archives or checksums, or upload
  release assets.

The release workflow must fail after a release if GitHub reports any uploaded
asset. It must use only the scoped `GITHUB_TOKEN`; no PAT, npm token, GitHub App
credential, release environment, or manual secret is part of this design.

## Change Routing and Version Bumps

Routing is determined from changed paths and the user-visible contract, never
from a Conventional Commit scope alone. A pull request is the required review
boundary for every plugin, release, validation, workflow, schema, security,
permission, or compatibility change.

| Change class                                                                                                                                                                                    | Integration route                                       | Version action                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plugin behavior, skill instructions, agent metadata, hook, app, MCP, declared component, permission, runtime asset, compatibility, security behavior, or user-visible fix under `plugins/<id>/` | PR                                                      | Release Please bumps only that plugin after a releasable Conventional Commit reaches `main`; the PR must update its `Unreleased` section and relevant README. |
| New plugin or breaking plugin change                                                                                                                                                            | PR                                                      | Initial or major/pre-1.0 SemVer release; manifest, README, changelog, catalog, and release configuration must be synchronized.                                |
| Plugin README or changelog editorial correction that does not alter behavior, version claims, compatibility, permissions, installation, or release history                                      | PR                                                      | No bump. It must not use a releasable `feat`, `fix`, or breaking-change commit type.                                                                          |
| Repository scripts, schemas, generators, tests, CI, workflows, release controls, GitHub labels, security policy, or contributor policy                                                          | PR                                                      | No plugin bump unless the same PR also changes a plugin contract.                                                                                             |
| Root README, `AGENTS.md`, architecture decisions, operational documentation, release-history corrections, or marketplace-wide claims                                                            | PR                                                      | No plugin bump unless a documented claim reveals a plugin contract change, in which case split or include the affected plugin release work.                   |
| Plans, audits, maintenance records, and documentation under `docs/` that do not change a policy, product contract, public claim, or release record                                              | Direct push permitted after the full local quality gate | No bump.                                                                                                                                                      |

Direct pushes are therefore an exception for low-risk, non-product records only;
they are never valid for `plugins/`, `.agents/plugins/marketplace.json`,
`schemas/`, `scripts/`, `tests/`, `.github/`, `package.json`, root policy, or
release controls. A direct push that changes a plugin or any control is rejected
before it reaches `main` by the routing validator.

The release-contract validator must inspect the actual `base..head` changed
paths. For a plugin change it must require both a non-empty `Unreleased`
section and one of these explicit release intents: `feat`, `fix`, `perf`, a
breaking-change footer, or `Release-As`. `docs`, `chore`, `refactor`, and test
types do not bump a plugin by themselves. A release PR generated by Release
Please is the narrow exception: it updates version/changelog/control files but
does not require a fresh `Unreleased` entry.

## Automation Topology

```text
plugin change + Conventional Commit
  -> quality and release-contract validation
  -> Release Please updates one release PR per affected plugin
  -> reviewed merge to main
  -> immutable plugin/<id>/vX.Y.Z tag + GitHub Release notes
  -> verify manifest, changelog, tag, release and zero uploaded assets
```

The workflow has two mutually exclusive states: no releaseable changes creates
or updates no release; a merged Release Please pull request creates only Git
metadata and a GitHub Release record. It never builds an artifact.

## Testing and Verification

Tests must parse configuration and workflow YAML/JSON rather than depend on a
live GitHub mutation. They must cover valid and invalid SemVer, component path
coverage, manifest/changelog/version disagreement, exact tag parsing, changed
plugin without `Unreleased`, and forbidden publishing or asset-upload commands.

The local gate includes the new release-contract validator. A remote smoke test
after a deliberately approved future release must prove the tag/release pair,
manifest/changelog alignment, zero uploaded assets, and no registry publication.

## Acceptance Criteria

- Every current plugin has an independent Release Please component and retains
  its package-local manifest as its sole version source.
- A release PR updates only the affected plugin's manifest and changelog plus
  release-control metadata.
- Releases use `plugin/<id>/vX.Y.Z` tags and GitHub Release notes, with zero
  uploaded assets and no package publication.
- Invalid version, changelog, tag, path, or asset behavior is rejected by
  automated tests and local validation.
- Documentation accurately distinguishes platform-provided source archives from
  prohibited uploaded distribution artifacts.
