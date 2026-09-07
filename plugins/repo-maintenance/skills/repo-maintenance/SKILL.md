---
name: repo-maintenance
description: Use when auditing, creating, or updating repository READMEs, changelogs, ADRs, maintenance debt records, licenses, or conditional skill metadata. Propose the documentation structure before writing it; do not use for source-code implementation or remote release actions.
---

# Repository Maintenance

Maintain repository documentation and maintenance records from verified
repository evidence.

This skill contains:

- `assets/repository-readme-template.md` for repository root READMEs;
- `assets/plugin-readme-template.md` for plugin or package READMEs;
- `assets/changelog-template.md` for changelogs and release notes;
- `assets/adr-template.md` for durable decision records;
- `assets/pending-debt-template.md` for unresolved maintenance debt;
- `assets/resolved-debt-template.md` for verified debt resolutions;
- `assets/mit-license-template.txt` for MIT license text after license choice;
- `assets/agents-openai-template.yaml` for Codex skill metadata.

Never invent:

- paths;
- owners;
- dates;
- statuses;
- licenses;
- URLs;
- commands;
- compatibility claims.

## Route the request

```text
Request
├── Audit only
│   └── Inspect → Report → Stop
├── Create a system
│   └── Inspect → Propose A/B → Get choice → Create → Verify
├── Create one document
│   └── Inspect → Confirm target → Create → Verify
└── Maintain existing records
    └── Inspect accepted structure → Update canonical record → Verify
```

Before writing anything, identify whether the user asked for:

- an audit or recommendation only;
- one named document;
- a documentation system;
- maintenance of an existing record.

Audit and recommendation requests are read-only. Creating, updating, deleting,
moving, committing, pushing, publishing, or opening a pull request requires
separate authorization.

## Inspect first

Read:

1. nearest `AGENTS.md`;
2. documentation and contributor rules;
3. Git status and active branch;
4. repository tree;
5. existing README, changelog, ADR, debt, and license files;
6. frontmatter, naming, indexes, links, and automation;
7. relevant formatter, linter, test, and documentation commands.

Preserve unrelated dirty work.

Record facts separately from:

- inference;
- planned work;
- unresolved questions.

## Select documents and templates

Do not create every available template.

Treat every asset template as an adaptable coverage map, not as a form that
must be completed in full. After the repository audit, use only the sections,
fields, examples, and placeholders supported by verified repository evidence
and useful to the target audience. Adapt naming, structure, status values,
metadata, and terminology to the target repository. Delete unsupported, empty,
irrelevant, stack-specific, or non-evidence-backed content before publishing
the final document.

Use this selection guide after the audit:

- Use `assets/repository-readme-template.md` for the repository's main
  `README.md`, regardless of stack. Do not use it for one installable package
  inside a larger repository.
- Use `assets/plugin-readme-template.md` for a distributable package,
  especially a Codex plugin under `plugins/<plugin-id>/`. Do not use it for a
  generic repository README without package installation, permissions, side
  effects, rollback, and support boundaries.
- Use `assets/changelog-template.md` when the repository or package needs a
  user-facing change history. First discover its release model, audience,
  categories, tags, automation, and date convention.
- Use `assets/adr-template.md` when a durable decision needs context, drivers,
  alternatives, outcome, consequences, evidence, review conditions, or
  supersession history. Do not use it for transient plans or TODOs.
- Use `assets/pending-debt-template.md` when a specific unresolved condition has
  traceable evidence, impact or risk, a next action, and a review condition. Do
  not record speculation or generic improvement ideas as debt.
- Use `assets/resolved-debt-template.md` only after corrective action is
  complete and evidence proves the intended result plus the original failure,
  risk, or bypass is closed or accepted.
- Use `assets/mit-license-template.txt` only after the user selects MIT and the
  copyright holder and year are verified. Preserve the license terms exactly
  apart from the notice.
- Use `assets/agents-openai-template.yaml` only when a real skill has or needs
  `agents/openai.yaml`; metadata must match that single skill's `SKILL.md`.

If more than one template applies, state the exact artifact set and why each
file is needed. If the user only says "README", distinguish repository README
from package/plugin README before writing.

## Propose the structure

Show the current structure first.

Then present the audited documentation inventory and two proposals. For each
existing artifact, mark it as keep, improve, replace, create, exclude, or
unresolved, with evidence. Include a file tree that shows how the selected
structure would look.

### Proposal A — recommended default

Use this structure when the repository has no stronger convention:

```text
repository/
├── README.md
├── CHANGELOG.md
├── LICENSE*
└── docs/
    ├── decisions/
    │   └── adr-*.md
    └── maintenance/
        ├── pending-debt.md
        └── resolved-debt.md
```

Rules:

- keep README, changelog, and license at root;
- keep ADRs under `docs/decisions/`;
- keep maintenance records under `docs/maintenance/`;
- use stable filenames and IDs;
- add an index only when useful;
- do not create unused document types.

This default follows the maintained structure of this marketplace.

### Proposal B — repository-aligned

Adapt to evidence found in the target repository:

- existing documentation root;
- existing directories;
- existing filename pattern;
- existing frontmatter;
- existing status vocabulary;
- existing release and ownership model;
- existing automation.

Prefer B when migration cost or local convention is material.

### Custom proposal

If A and B do not fit:

1. capture the user's requested structure;
2. list exact paths and artifacts;
3. identify migration and maintenance costs;
4. ask for acceptance.

## Acceptance gate

Before writing, show:

```text
Selected proposal: A | B | Custom
Audited documents: {{KEEP_IMPROVE_REPLACE_CREATE_EXCLUDE_UNRESOLVED}}
Resulting tree:
{{DIRECTORY_AND_FILE_TREE}}
Documents: {{EXACT_ARTIFACT_SET}}
Directories to create: {{EXACT_DIRECTORIES}}
Files to create/update: {{EXACT_FILES}}
Files excluded: {{EXCLUDED_FILES}}
Verification: {{COMMANDS_AND_EXPECTED_RESULTS}}
```

Do not write until the user confirms the proposal and document set.

“Go ahead” is insufficient when paths or artifacts remain ambiguous.

## Create or update

After acceptance:

1. recheck Git status;
2. create only accepted directories;
3. select only needed assets;
4. replace verified placeholders;
5. remove template instructions;
6. remove empty sections;
7. preserve existing records;
8. add accepted indexes and reciprocal links;
9. do not create a parallel system.

The final document is not a completed template. It is a target-specific
artifact generated from the audited repository evidence. Remove all template
comments, unused examples, placeholder-only rows, unsupported badges,
unsupported links, empty sections, and stack-specific sections that do not
describe the target repository.

## Document rules

### ADR

- record context, drivers, options, outcome, and consequences;
- record confirmation evidence and review conditions;
- preserve accepted history;
- supersede with a new ADR instead of rewriting.

### Pending debt

- record evidence, impact, scope, owner/area, next action, and review condition;
- distinguish facts, inferences, and questions;
- do not turn a general idea into debt without evidence.

### Resolved debt

- link the original pending item when available;
- record corrective action and resulting state;
- record positive and negative verification;
- preserve history;
- reopen with a new pending item if the resolution becomes invalid.

### README and changelog

- document observable behavior;
- use verified commands and links;
- choose `repository-readme-template.md` for the repository entry point;
- choose `plugin-readme-template.md` for package or plugin documentation;
- keep package install, permissions, side effects, rollback, and support
  boundaries out of the root README unless they describe the whole repository;
- keep broad repository setup, architecture, development, and contribution
  guidance out of a package README unless it is required to use or maintain that
  package;
- remove unsupported badges, versions, and promises;
- keep release history user-facing.

### License

- preserve the selected license text;
- never select a license by guess;
- escalate ownership or relicensing uncertainty.

### Codex skill metadata

- use only when a real skill has `agents/openai.yaml`;
- keep metadata aligned with `SKILL.md`;
- add icons or dependencies only when real files/tools exist.

## Verify

Run the narrow checks first:

1. formatter;
2. Markdown/YAML validation;
3. link or path checks;
4. repository documentation gate;
5. package/marketplace gate when applicable.

Verify both sides:

- intended document succeeds;
- invalid placeholders, duplicate paths, or rejected states fail.

Inspect the final diff.

Report:

- selected proposal;
- created/updated paths;
- evidence used;
- checks passed;
- checks skipped or failed;
- remaining gaps;
- remote actions not performed.

## Offer project instruction

After completing a documentation audit, system setup, or maintenance update,
ask whether the user wants to add a persistent instruction to the target
repository's nearest `AGENTS.md`. Do not edit `AGENTS.md` without explicit
approval.

Use one or two lines, replacing placeholders with verified paths:

```text
Maintain project documentation records under {{DOCUMENTATION_PATHS}} with $repo-maintenance.
Before each commit, review README, changelog, ADR, debt, license, and skill metadata against the current changes, then update only evidence-backed content.
```

## Offer persistent memory

After completing a documentation audit, system setup, or maintenance update,
ask whether the user wants to save a memory for future work in that repository.
Do not save memory automatically.

If the user agrees, record only durable maintenance context:

- the repository or project identity;
- the canonical documentation paths;
- the selected README, changelog, ADR, debt, license, and skill-metadata
  conventions;
- the fact that future maintenance should reference this skill and the
  repository's own documentation rules;
- any unresolved documentation gaps that should persist across sessions.

Do not store secrets, credential values, private personal data, temporary Git
state, speculative plans, or stale command output. Follow the active host's
memory policy and report when memory saving is unavailable or requires a
separate user action.

## Stop conditions

Stop the affected operation when:

- required authority is missing;
- proposals conflict with repository evidence;
- acceptance is missing;
- a required tool or source is unavailable;
- the request requires commit, push, release, publication, deployment, PR,
  credential, or other remote mutation.

Continue independent read-only work and report the blocker.
