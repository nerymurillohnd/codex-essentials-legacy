<!--
Authoring instructions (delete this comment before publishing):

1. Inspect the actual product, intended audience, supported stack and environments,
   repository-defined scripts, license terms, and documentation conventions.
2. Replace every {{UPPER_SNAKE_CASE}} placeholder with verified project information.
3. Do not infer features, compatibility, support commitments, security properties,
   performance, adoption, maturity, or release status from names or directory layout.
4. Keep only sections that help the intended reader. Delete conditional guidance,
   empty tables, unused examples, inapplicable sections, and all authoring comments.
5. Prefer the repository's real commands and terminology. Confirm that every link,
   path, command, prerequisite, and configuration key exists and works as described.
6. Write for users and contributors. Put internal maintenance procedures in their
   appropriate project documentation instead of expanding this README into a manual.
-->

# {{PROJECT_NAME}}

{{ONE_SENTENCE_VALUE_PROPOSITION}}

<!--
Explain what the project is, who it is for, and why it is useful. Lead with the
reader's outcome, not an internal implementation detail. Add a short screenshot,
diagram, or demo link only when it materially clarifies the product.
-->

{{PROJECT_OVERVIEW}}

## Status

<!--
Optional: state only a verified lifecycle, stability, availability, or maintenance
status. Keep only maintained badges that help readers assess the project. Do not add
badges by default, and remove this section when it adds no useful information.
-->

{{PROJECT_STATUS}}

{{BADGE_MARKDOWN}}

<!-- Optional: add a compact navigation line only when this README is long enough to need it. -->

{{README_NAVIGATION}}

## Quick start

<!--
Provide the shortest verified path from a supported environment to a useful result.
Do not duplicate the full setup guide here. If there is no meaningful quick start,
remove this section.
-->

```text
{{QUICK_START_COMMANDS}}
```

{{QUICK_START_RESULT}}

## Use cases

<!--
Describe concrete problems readers can solve. Remove this section when the project's
purpose is already obvious and examples would add no useful information.
-->

- **{{USE_CASE_ONE_NAME}}:** {{USE_CASE_ONE_OUTCOME}}
- **{{USE_CASE_TWO_NAME}}:** {{USE_CASE_TWO_OUTCOME}}
- **{{USE_CASE_THREE_NAME}}:** {{USE_CASE_THREE_OUTCOME}}

## Features and capabilities

<!--
List only implemented, user-visible capabilities. Distinguish experimental or partial
behavior explicitly. Delete extra items and remove the section if it would repeat the
overview.
-->

- **{{CAPABILITY_ONE_NAME}}:** {{CAPABILITY_ONE_DESCRIPTION}}
- **{{CAPABILITY_TWO_NAME}}:** {{CAPABILITY_TWO_DESCRIPTION}}
- **{{CAPABILITY_THREE_NAME}}:** {{CAPABILITY_THREE_DESCRIPTION}}

## Requirements

<!--
State verified runtime, platform, account, hardware, network, or access prerequisites.
Include supported version ranges only when an authoritative project source defines them.
Remove this section if the project has no prerequisites beyond its installation medium.
-->

- {{REQUIREMENT_ONE}}
- {{REQUIREMENT_TWO}}

## Installation and setup

<!--
Use the project's supported installation path. Include source setup only if the intended
audience needs it. Never invent a package registry, installer, hosting provider, or
operating-system requirement.
-->

1. {{INSTALLATION_STEP_ONE}}
2. {{INSTALLATION_STEP_TWO}}
3. {{INSTALLATION_STEP_THREE}}

```text
{{INSTALLATION_COMMANDS}}
```

{{SETUP_VERIFICATION}}

## Configuration

<!--
Document only public configuration that readers must set or commonly change. Never put
real credentials in this file. Use variable names or safe example values, identify
defaults and required fields, and link to deeper configuration documentation when it
exists. Remove this section if no configuration is required.
-->

| Setting              | Required   | Default           | Description                |
| -------------------- | ---------- | ----------------- | -------------------------- |
| `{{CONFIG_KEY_ONE}}` | {{YES_NO}} | `{{DEFAULT_ONE}}` | {{CONFIG_ONE_DESCRIPTION}} |
| `{{CONFIG_KEY_TWO}}` | {{YES_NO}} | `{{DEFAULT_TWO}}` | {{CONFIG_TWO_DESCRIPTION}} |

```text
{{CONFIGURATION_EXAMPLE}}
```

## Usage

<!--
Show one representative, verified workflow before advanced variants. Explain the
observable result and important side effects. Remove examples that do not apply to the
actual interface, whether it is a library, service, application, dataset, document, or
other project type.
-->

### {{USAGE_EXAMPLE_NAME}}

```text
{{USAGE_EXAMPLE}}
```

{{USAGE_EXAMPLE_RESULT}}

<!-- Optional: keep only when the project has meaningful advanced workflows. -->

### {{ADVANCED_USAGE_NAME}}

{{ADVANCED_USAGE_DESCRIPTION}}

## Architecture and repository map

<!--
Explain the smallest amount of structure needed to navigate or understand the project.
Inspect the real architecture and paths; do not impose a standard directory layout.
Remove this section for artifacts that do not benefit from an architecture or map.
-->

{{ARCHITECTURE_SUMMARY}}

| Path or component | Responsibility         |
| ----------------- | ---------------------- |
| `{{PATH_ONE}}`    | {{PATH_ONE_PURPOSE}}   |
| `{{PATH_TWO}}`    | {{PATH_TWO_PURPOSE}}   |
| `{{PATH_THREE}}`  | {{PATH_THREE_PURPOSE}} |

{{ARCHITECTURE_DOCUMENTATION_LINK}}

## Development, quality, and testing

<!--
Use repository-defined workflows and scripts. Separate environment setup, focused
checks, and the full validation gate when they differ. Do not prescribe a language,
package manager, test framework, or CI provider. Remove this section when the project
does not accept development contributions.
-->

```text
{{DEVELOPMENT_SETUP_COMMANDS}}
```

| Task                 | Command or workflow           |
| -------------------- | ----------------------------- |
| Format               | `{{FORMAT_COMMAND}}`          |
| Lint                 | `{{LINT_COMMAND}}`            |
| Type or static check | `{{STATIC_CHECK_COMMAND}}`    |
| Test                 | `{{TEST_COMMAND}}`            |
| Full validation      | `{{FULL_VALIDATION_COMMAND}}` |

{{DEVELOPMENT_NOTES}}

## Deployment and operations

<!--
Optional: keep only for projects with a supported deployment or operational lifecycle.
Describe verified environments, release or deployment entry points, health checks,
rollback or recovery, and ownership boundaries. Link to detailed runbooks instead of
placing sensitive or fast-changing operational procedures here.
-->

- **Environment:** {{DEPLOYMENT_ENVIRONMENT}}
- **Deployment or release:** `{{DEPLOYMENT_COMMAND_OR_WORKFLOW}}`
- **Verification:** {{DEPLOYMENT_VERIFICATION}}
- **Rollback or recovery:** {{ROLLBACK_OR_RECOVERY}}
- **Operations documentation:** {{OPERATIONS_DOCUMENTATION_LINK}}

## Security

<!--
State the supported vulnerability-reporting channel and any important security boundary.
Do not claim that the project is secure, audited, compliant, encrypted, or vulnerability-
free without authoritative evidence. Remove policy details that belong in a dedicated
security document, but retain a clear reporting path when one exists.
-->

Report vulnerabilities through {{SECURITY_REPORTING_CHANNEL}}. See
{{SECURITY_POLICY_LINK}} for supported versions, disclosure expectations, and response
guidance.

{{SECURITY_BOUNDARY_OR_LIMITATION}}

## Contributing

<!--
Explain the public contribution path and its essential gates. Match the repository's
actual conventions for issues, change proposals, commits, reviews, and validation.
Link to a contributor guide instead of reproducing internal maintainer procedures.
Remove this section if contributions are not accepted.
-->

1. {{CONTRIBUTION_STEP_ONE}}
2. {{CONTRIBUTION_STEP_TWO}}
3. {{CONTRIBUTION_STEP_THREE}}

See {{CONTRIBUTING_GUIDE_LINK}} for the complete contribution guidelines.

## Roadmap and limitations

<!--
Keep either or both subsections when they set useful expectations. Label proposals as
proposals, link to the authoritative tracker when one exists, and do not present planned
work as implemented. Remove stale promises, speculative dates, and empty subsections.
-->

### Roadmap

- {{ROADMAP_ITEM_ONE}}
- {{ROADMAP_ITEM_TWO}}

### Known limitations

- {{LIMITATION_ONE}}
- {{LIMITATION_TWO}}

## Support

<!--
List only monitored support or community channels and state their scope when needed.
Do not imply response times or service levels unless they are documented commitments.
-->

- **Help and questions:** {{SUPPORT_CHANNEL}}
- **Bug reports:** {{BUG_REPORTING_CHANNEL}}
- **Documentation:** {{DOCUMENTATION_LINK}}

## License and attribution

<!--
Inspect the actual legal files and project policy before completing this section. Do not
assume an open-source license. State confirmed licensing terms, preserve required notices,
and remove attribution text when none is required. If use or redistribution rights are
not granted, describe that status accurately or direct readers to the project owner.
-->

{{LICENSE_STATEMENT}}

{{ATTRIBUTION_STATEMENT}}
