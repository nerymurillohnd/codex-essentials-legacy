<!--
Architecture Decision Record template

Before publishing an ADR:
- Follow the repository's existing ADR location, filename, identifier, metadata, and
  status conventions. This template intentionally does not prescribe a path, numbering
  scheme, frontmatter schema, approval model, or legal footer.
- Replace every {{UPPER_SNAKE_CASE}} placeholder. Remove instructional comments and any
  optional fields or sections that do not apply.
- Describe the decision as it was made. Preserve accepted records as historical evidence;
  when direction changes, prefer a new ADR that links to the record it supersedes.
- Link claims to durable evidence where practical. Distinguish intended confirmation from
  evidence already observed.
-->

# {{DECISION_TITLE}}

<!-- Add, remove, or rename fields to match the project's established conventions. -->

| Field           | Value                          |
| --------------- | ------------------------------ |
| Identifier      | {{DECISION_IDENTIFIER}}        |
| Status          | {{DECISION_STATUS}}            |
| Decision date   | {{DECISION_DATE}}              |
| Decision owners | {{DECISION_OWNERS}}            |
| Scope           | {{DECISION_SCOPE}}             |
| Supersedes      | {{SUPERSEDED_RECORDS_OR_NONE}} |
| Superseded by   | {{SUPERSEDING_RECORD_OR_NONE}} |

## Status and lifecycle

<!--
Use the project's status vocabulary. Common examples include proposed, accepted, rejected,
deprecated, and superseded, but these are suggestions rather than universal requirements.
Explain the current state, who can change it when relevant, and the event or evidence that
would trigger review. Keep links to superseding or superseded records current.
-->

**Current status:** {{DECISION_STATUS}}

{{STATUS_RATIONALE_AND_REVIEW_TRIGGER}}

## Context and problem statement

<!--
Describe the situation, the problem or opportunity, relevant constraints, and why a decision
is needed now. Include enough background for a reader who was not present. A decision question
can help make the problem testable, but it is optional.
-->

{{CONTEXT_AND_PROBLEM_STATEMENT}}

## Decision drivers

<!--
List the forces that materially shape the decision: desired qualities, constraints, risks,
costs, deadlines, compatibility needs, or operational concerns. Do not invent requirements.
Order or weight the drivers only when the project actually uses prioritization.
-->

- {{DECISION_DRIVER}}
- {{ADDITIONAL_DECISION_DRIVER}}

## Considered options

<!--
List the credible options that were evaluated, including the status quo when relevant. Add or
remove option blocks as needed; the template does not require a fixed number of alternatives.
-->

### {{OPTION_A_NAME}}

{{OPTION_A_DESCRIPTION}}

- Benefits: {{OPTION_A_BENEFITS}}
- Drawbacks: {{OPTION_A_DRAWBACKS}}
- Risks and uncertainties: {{OPTION_A_RISKS}}
- Evidence or assumptions: {{OPTION_A_EVIDENCE_AND_ASSUMPTIONS}}

### {{OPTION_B_NAME}}

{{OPTION_B_DESCRIPTION}}

- Benefits: {{OPTION_B_BENEFITS}}
- Drawbacks: {{OPTION_B_DRAWBACKS}}
- Risks and uncertainties: {{OPTION_B_RISKS}}
- Evidence or assumptions: {{OPTION_B_EVIDENCE_AND_ASSUMPTIONS}}

<!-- Duplicate the option block for each additional credible alternative. -->

## Decision outcome

**Chosen option:** {{CHOSEN_OPTION}}

{{DECISION_RATIONALE}}

<!--
Explain why the chosen option best satisfies the decision drivers, why material alternatives
were not selected, and which assumptions the outcome depends on. Record dissent or unresolved
uncertainty when it materially affects future review.
-->

### Scope of the decision

{{IN_SCOPE_AND_OUT_OF_SCOPE}}

## Consequences

<!--
Capture expected effects, not only advantages. Make tradeoffs, follow-up work, migration impact,
and operational ownership explicit where they exist. Remove categories that add no information.
-->

### Positive consequences

- {{POSITIVE_CONSEQUENCE}}

### Negative consequences and tradeoffs

- {{NEGATIVE_CONSEQUENCE_OR_TRADEOFF}}

### Neutral or secondary effects

- {{NEUTRAL_OR_SECONDARY_EFFECT}}

### Risks and mitigations

| Risk     | Likelihood or condition          | Impact          | Mitigation or response | Owner          |
| -------- | -------------------------------- | --------------- | ---------------------- | -------------- |
| {{RISK}} | {{RISK_LIKELIHOOD_OR_CONDITION}} | {{RISK_IMPACT}} | {{RISK_MITIGATION}}    | {{RISK_OWNER}} |

## Implementation and transition

<!--
Optional. Summarize work needed to realize the decision, dependencies, sequencing constraints,
compatibility or migration concerns, and rollback or recovery conditions. Link to the delivery
plan or tracked work instead of duplicating it in detail.
-->

{{IMPLEMENTATION_AND_TRANSITION_NOTES}}

## Confirmation and evidence

<!--
Define how people can tell that the decision was implemented and remains effective. Record both
successful confirmation and the failure signal that would reveal a broken or bypassed outcome
when applicable. Mark planned evidence as pending; do not present it as already observed.
-->

| Criterion or claim                  | Verification method              | Evidence or result                      | Responsible party               | Review condition              |
| ----------------------------------- | -------------------------------- | --------------------------------------- | ------------------------------- | ----------------------------- |
| {{CONFIRMATION_CRITERION}}          | {{VERIFICATION_METHOD}}          | {{EVIDENCE_OR_PENDING_RESULT}}          | {{CONFIRMATION_OWNER}}          | {{REVIEW_CONDITION}}          |
| {{NEGATIVE_CONFIRMATION_CRITERION}} | {{NEGATIVE_VERIFICATION_METHOD}} | {{NEGATIVE_EVIDENCE_OR_PENDING_RESULT}} | {{NEGATIVE_CONFIRMATION_OWNER}} | {{NEGATIVE_REVIEW_CONDITION}} |

## Links and references

<!-- Prefer stable, accessible references. Label unavailable or historical evidence clearly. -->

- Related decisions: {{RELATED_DECISION_LINKS_OR_NONE}}
- Requirements or constraints: {{REQUIREMENT_LINKS_OR_NONE}}
- Supporting evidence: {{EVIDENCE_LINKS_OR_NONE}}
- Implementation tracking: {{IMPLEMENTATION_LINKS_OR_NONE}}
- External references: {{EXTERNAL_REFERENCE_LINKS_OR_NONE}}

## Supersession

<!--
If this record supersedes another ADR, link it and summarize what changed. If this record is
later superseded, retain it as historical evidence, update its lifecycle metadata according to
project convention, and link the replacement ADR here.
-->

{{SUPERSESSION_DETAILS_OR_NOT_APPLICABLE}}

## Decision history

<!-- Optional. Keep this concise; source control may already provide sufficient history. -->

| Date             | Status             | Change             | Author or approver |
| ---------------- | ------------------ | ------------------ | ------------------ |
| {{HISTORY_DATE}} | {{HISTORY_STATUS}} | {{HISTORY_CHANGE}} | {{HISTORY_ACTOR}}  |

---

_Structure adapted from the [Markdown Architectural Decision Records
(MADR)](https://github.com/adr/madr) project._
