# Pending Maintenance Debt

> Template instructions — delete this block before publishing the ledger.
>
> 1. Inspect the project's agent instructions, documentation structure, existing maintenance
>    records, and tracking conventions before creating or updating a ledger. Use the established
>    canonical location instead of creating a parallel record.
> 2. Adapt the title, headings, metadata, status values, categories, and terminology to the
>    project's conventions. Add frontmatter or other metadata only when the project already
>    requires it. If no taxonomy exists, use the smallest set of statuses and categories that
>    helps maintainers route and review the work.
> 3. Replace every `{{UPPER_SNAKE_CASE}}` placeholder. Omit optional fields that provide no
>    operational value. Delete all template instructions and unused example content.
> 4. Use a stable identifier when entries may be referenced, reordered, or moved between pending
>    and resolved records. Follow the project's identifier format; do not introduce one solely to
>    complete the template.
> 5. Record a person or delivery date only when one has actually been assigned or committed. When
>    no owner exists, name the responsible system or project area if known; otherwise state that
>    assignment is unresolved without inventing accountability.

## Purpose

Maintain a living record of unresolved technical or maintenance conditions that require follow-up,
reassessment, or verified remediation.

## Entry criteria

Add an item only when all of the following are true:

- A specific unresolved condition, limitation, deferred remediation, or follow-up requirement is
  observable or supported by traceable evidence.
- The condition has a meaningful operational, security, reliability, compatibility, quality,
  cost, or maintainability impact or risk.
- A maintainer can identify a next action or a concrete condition for reassessment.
- The item is not already represented by an active canonical record unless this ledger is the
  project's designated summary or risk register for that work.

Do not add unverified speculation, general improvement ideas, work that is already resolved, or a
copy of every backlog task. Capture unresolved questions only when they materially affect the
assessment or next action, and label them as questions rather than facts.

## Record maintenance

- **Append:** Add a new entry only after checking for an existing record of the same condition.
  Preserve the ledger's established ordering and identifier conventions.
- **Update:** Revise the existing entry when evidence, impact, scope, status, ownership, next
  action, dependencies, or review conditions change. Keep confirmed facts distinct from
  inferences and open questions; do not overwrite history that the project's recordkeeping
  conventions require retaining.
- **Resolve:** Close an item only after the remediation or accepted disposition is supported by
  verification evidence. If the project maintains a resolved-debt record, move the entry there
  with its stable identifier, resolution outcome, verification evidence, and relationship to the
  pending record. Otherwise, archive or mark it resolved according to the project's existing
  convention. Remove it from the open list only after the receiving record is complete when such a
  record exists.

## Open items

### {{DEBT_ID}} — {{SHORT_TITLE}}

- **Status:** {{STATUS}}
- **Category:** {{CATEGORY}}
- **Scope:** {{AFFECTED_SCOPE}}
- **Evidence:**
  - **Confirmed facts:** {{CONFIRMED_FACTS_AND_SOURCES}}
  - **Inferences:** {{INFERENCES_OR_NONE}}
  - **Open questions:** {{OPEN_QUESTIONS_OR_NONE}}
- **Impact / risk:** {{CURRENT_IMPACT_AND_PLAUSIBLE_RISK}}
- **Owner / responsible area:** {{KNOWN_OWNER_OR_RESPONSIBLE_AREA}}
- **Next action:** {{SMALLEST_CONCRETE_NEXT_ACTION}}
- **Dependencies:** {{DEPENDENCIES_OR_NONE}}
- **Target / review condition:** {{COMMITTED_TARGET_OR_REASSESSMENT_CONDITION}}
- **Related records:** {{RELATED_RECORDS_OR_NONE}}
