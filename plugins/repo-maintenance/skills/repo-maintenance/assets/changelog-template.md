# Changelog

<!--
TEMPLATE INSTRUCTIONS — DELETE THIS COMMENT BEFORE PUBLISHING

1. Discover the repository's existing convention before editing: inspect prior
   changelog or release-note files, contribution guidance, release automation,
   tags, and recent releases. Preserve established terminology and structure
   unless the task explicitly calls for a migration.
2. Identify the primary audience (for example, end users, API consumers,
   operators, integrators, or maintainers). Write entries for that audience and
   explain observable impact. Exclude routine refactors, dependency churn,
   formatting, tests, and build-system noise unless they change behavior,
   compatibility, security, operations, or contributor requirements.
3. Determine the release model before adding release headings: semantic
   versions, calendar versions, dated releases, named releases, milestones, or
   a continuously delivered/rolling record are all valid. Keep a Changelog and
   Semantic Versioning are compatible options, not universal requirements.
4. Confirm the project's date convention and use real release dates only. ISO
   8601 (`YYYY-MM-DD`) is a portable default when no convention exists. Never
   guess a release date or use a planned date as though the release occurred.
5. Discover the canonical repository, release, comparison, migration, and
   security-advisory URLs before adding links. Remove link definitions that the
   repository cannot support; never invent a URL.
6. Replace every `{{UPPER_SNAKE_CASE}}` placeholder and delete all unused
   examples, empty sections, and template comments.
-->

Notable changes to {{PROJECT_NAME}} are documented here for {{PRIMARY_AUDIENCE}}.

<!--
Optionally state the adopted convention, for example:

This changelog is compatible with Keep a Changelog, and this project uses
Semantic Versioning.

Include that statement only when both claims match the repository's actual
release process. Link to the adopted specifications if useful to readers.
-->

## Unreleased

<!--
Keep an Unreleased section when the project accumulates changes before a
release. For continuous delivery, replace it with the repository's established
rolling or dated structure.

Add only categories that contain audience-relevant entries. Common choices
include Added, Changed, Deprecated, Removed, Fixed, Security, Performance,
Documentation, and Migration, but the repository may use different categories.
Do not create empty headings merely to complete a standard list.

Write each entry in terms of the affected capability, observable impact, and
any action the reader must take. Examples below are patterns, not required
categories:

### Added

- {{USER_FACING_ADDITION_AND_BENEFIT}}

### Changed

- {{USER_FACING_CHANGE_AND_IMPACT}}

### Fixed

- {{USER_FACING_PROBLEM_AND_RESOLUTION}}

### Deprecated

- {{DEPRECATED_CAPABILITY}}, with replacement guidance and the removal window
  when confirmed.

### Security

- {{SECURITY_IMPROVEMENT_AND_USER_ACTION}}. State affected and remediated
  versions when verified, and link to a public advisory when available. Do not
  disclose exploit-enabling details, secrets, private reports, or an unpatched
  attack path.
-->

<!--
BREAKING CHANGES AND MIGRATION

Make breaking changes unmistakable in the relevant release and category. State
what changed, who is affected, the first incompatible release or date, and the
required action. Add a concise migration procedure inline, or link to verified
migration documentation when the procedure is substantial. Describe rollback
or compatibility options when they exist. Do not label a change as breaking
solely because it was internally complex.

Example:

- **Breaking:** {{BREAKING_CHANGE_AND_IMPACT}}. Migrate by
  {{REQUIRED_MIGRATION_ACTION}}. See {{MIGRATION_GUIDE_URL}}.
-->

<!--
RELEASE ENTRIES

Copy this block only when the repository records discrete releases. Match its
established heading syntax and omit the date if releases are intentionally
undated. Use the actual release identifier and date; do not invent either.

## {{RELEASE_IDENTIFIER}} - {{RELEASE_DATE}}

### {{RELEVANT_CATEGORY}}

- {{RELEASED_CHANGE_AND_IMPACT}}
-->

<!--
COMPARE AND RELEASE LINKS

Add only links supported by the canonical host and release model. Use the
repository's established reference style. An Unreleased comparison generally
starts at the latest real release; a release comparison generally spans the
previous and current real releases. Initial releases may link to a tag or
release page instead of a comparison.

[Unreleased]: {{UNRELEASED_COMPARE_URL}}
[{{RELEASE_IDENTIFIER}}]: {{RELEASE_COMPARE_OR_RELEASE_URL}}
-->
