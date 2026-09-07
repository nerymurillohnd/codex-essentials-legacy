# {{PACKAGE_DISPLAY_NAME}}

<!--
AUTHORING INSTRUCTIONS — DELETE THIS BLOCK BEFORE PUBLICATION

1. Inspect the package manifest or equivalent source of truth. Confirm the
   package name, version source, declared components, host integration, legal
   metadata, and distribution channel. Do not infer them from this template.
2. Inspect every shipped component and its callers. Document only paths,
   capabilities, inputs, outputs, runtimes, hooks, apps, services, or tools that
   exist in the distributed package.
3. Identify the actual host and supported surfaces. Adapt host terminology,
   marketplace language, installation flow, and discovery behavior. Use Codex
   terms only when the package is verified to target Codex.
4. Verify installation, update, removal, and rollback behavior against current
   host documentation and the package's tested distribution source. Keep plugin
   installation effects separate from later effects on a target project.
5. Trace permissions and side effects from implementation: files read or
   written, processes run, hooks registered, network destinations, credential
   names, external mutations, caches, and persistent state. Never include a
   credential value.
6. Read the package's existing README, changelog, license, support policy,
   security policy, references, and examples. Preserve accurate product-specific
   guidance and replace stale or duplicated material.
7. Replace every {{UPPER_SNAKE_CASE}} placeholder, delete authoring comments,
   remove inapplicable conditional blocks and table rows, and remove any section
   that would otherwise be empty. Include links, paths, commands, versions,
   permissions, and compatibility claims only when verified.
8. Render and test the final README. Confirm that links resolve from the README
   location and that commands run from their stated working directory.
-->

> {{ONE_SENTENCE_USER_OUTCOME}}

{{PACKAGE_SUMMARY_AND_PRIMARY_BEHAVIOR}}

{{IMPORTANT_NON_GOAL_OR_BOUNDARY}}

<!-- Keep this notice only when users need to understand a material risk before installation or first use. -->

> [!CAUTION]
> {{MOST_IMPORTANT_PERMISSION_OR_SIDE_EFFECT_BOUNDARY}}

## Quick start

<!-- Use only installation commands verified for the actual host and distribution channel. -->

From `{{INSTALL_COMMAND_WORKING_DIRECTORY}}`:

```sh
{{VERIFIED_INSTALL_COMMANDS}}
```

{{FIRST_USE_INSTRUCTION}}

```text
{{CANONICAL_FIRST_USE_EXAMPLE}}
```

Expected result: {{QUICK_START_EXPECTED_RESULT}}

## Use cases

| Starting situation | How the package helps       | Observable outcome        |
| ------------------ | --------------------------- | ------------------------- |
| {{USE_CASE_ONE}}   | {{USE_CASE_ONE_BEHAVIOR}}   | {{USE_CASE_ONE_RESULT}}   |
| {{USE_CASE_TWO}}   | {{USE_CASE_TWO_BEHAVIOR}}   | {{USE_CASE_TWO_RESULT}}   |
| {{USE_CASE_THREE}} | {{USE_CASE_THREE_BEHAVIOR}} | {{USE_CASE_THREE_RESULT}} |

**Not a fit when:** {{NON_FIT_CASES_AND_RECOMMENDED_ALTERNATIVE}}

## Requirements and compatibility

| Requirement       | Verified support or constraint                    |
| ----------------- | ------------------------------------------------- |
| Host              | {{SUPPORTED_HOSTS_AND_SURFACES}}                  |
| Host version      | {{VERIFIED_HOST_VERSION_OR_RANGE}}                |
| Runtime and tools | {{REQUIRED_RUNTIMES_AND_TOOLS}}                   |
| Operating systems | {{SUPPORTED_OPERATING_SYSTEMS}}                   |
| Target projects   | {{SUPPORTED_TARGET_PROJECTS_OR_NOT_APPLICABLE}}   |
| Network           | {{NETWORK_REQUIREMENT}}                           |
| Credentials       | {{CREDENTIAL_VARIABLE_NAMES_AND_PURPOSE_OR_NONE}} |
| Last verified     | {{LAST_VERIFIED_DATE_AND_EVIDENCE_SOURCE}}        |

{{COMPATIBILITY_PRECEDENCE_OR_VERSION_DRIFT_NOTE}}

## Included components

<!--
List only shipped components verified from the manifest and package contents.
Add or remove rows as needed. Link a path only after confirming it resolves from
this README. Describe host metadata as such; do not present it as core behavior.
-->

| Component                        | Purpose                     | Activation or lifecycle        |
| -------------------------------- | --------------------------- | ------------------------------ |
| {{COMPONENT_ONE_PATH_OR_NAME}}   | {{COMPONENT_ONE_PURPOSE}}   | {{COMPONENT_ONE_ACTIVATION}}   |
| {{COMPONENT_TWO_PATH_OR_NAME}}   | {{COMPONENT_TWO_PURPOSE}}   | {{COMPONENT_TWO_ACTIVATION}}   |
| {{COMPONENT_THREE_PATH_OR_NAME}} | {{COMPONENT_THREE_PURPOSE}} | {{COMPONENT_THREE_ACTIVATION}} |

{{COMPONENTS_NOT_BUNDLED_CLARIFICATION}}

## Inputs and outputs

**Inputs:** {{USER_INPUTS_EVENTS_FILES_CONFIGURATION_AND_PRECONDITIONS}}

**Outputs:** {{MESSAGES_FILES_REPORTS_COMMANDS_STATE_CHANGES_OR_OTHER_RESULTS}}

{{INPUT_VALIDATION_AND_OUTPUT_DESTINATION_DETAILS}}

## Permissions and side effects

<!-- Derive every row from implementation and host behavior. Remove unsupported access categories. -->

| Phase or access   | Scope                                        | User-visible effect                  |
| ----------------- | -------------------------------------------- | ------------------------------------ |
| Installation      | {{INSTALLATION_STATE_SCOPE}}                 | {{INSTALLATION_STATE_EFFECT}}        |
| Read              | {{READ_SCOPE_OR_NONE}}                       | {{READ_EFFECT_OR_NONE}}              |
| Write             | {{WRITE_SCOPE_OR_NONE}}                      | {{WRITE_EFFECT_OR_NONE}}             |
| Process execution | {{PROCESS_SCOPE_OR_NONE}}                    | {{PROCESS_EFFECT_OR_NONE}}           |
| Network           | {{NETWORK_DESTINATIONS_AND_PURPOSE_OR_NONE}} | {{NETWORK_EFFECT_OR_NONE}}           |
| Authentication    | {{AUTHENTICATION_SCOPE_OR_NONE}}             | {{AUTHENTICATION_EFFECT_OR_NONE}}    |
| External services | {{EXTERNAL_MUTATION_SCOPE_OR_NONE}}          | {{EXTERNAL_MUTATION_EFFECT_OR_NONE}} |

### Installation effects

Installing the package: {{INSTALLATION_EFFECT_ON_HOST_MANAGED_STATE}}

Installing the package does not by itself: {{INSTALLATION_NON_EFFECTS_ON_TARGET_PROJECT}}

### Runtime effects on a target project

After installation, using or enabling the package may:
{{RUNTIME_EFFECTS_ON_TARGET_PROJECT_AND_TRIGGER_CONDITIONS}}

### Approval boundaries

{{READ_ONLY_DEFAULTS_AND_ACTIONS_REQUIRING_APPROVAL}}

<!-- Keep this paragraph only for automatic hooks, background work, or privileged integrations. -->

Before enabling {{AUTOMATIC_OR_PRIVILEGED_COMPONENT}}, review
{{IMPLEMENTATION_OR_CONFIGURATION_REFERENCE}} and confirm that its scope is
appropriate for the target environment.

## Installation

<!--
Name the verified distribution source and host. Do not assume a marketplace,
repository branch, package manager, or global configuration model.
-->

1. {{INSTALLATION_STEP_ONE}}
2. {{INSTALLATION_STEP_TWO}}
3. {{INSTALLATION_STEP_THREE}}

```sh
{{VERIFIED_INSTALLATION_COMMANDS}}
```

Installation is complete when: {{INSTALLATION_SUCCESS_SIGNAL}}

<!-- Keep only when an existing installation requires migration or duplicate-discovery handling. -->

### Migration from an existing installation

{{MIGRATION_PRECHECK_BACKUP_AND_DEDUPLICATION_STEPS}}

## Verification

### Consumer smoke test

From `{{CONSUMER_TEST_WORKING_DIRECTORY}}`:

```sh
{{VERIFIED_CONSUMER_TEST_COMMANDS}}
```

Expected positive result: {{EXPECTED_POSITIVE_RESULT}}

Expected negative or rejection result: {{EXPECTED_NEGATIVE_RESULT}}

### Maintainer checks

<!-- Keep only checks that exist in the package or its maintenance repository. -->

From `{{MAINTAINER_CHECK_WORKING_DIRECTORY}}`:

```sh
{{VERIFIED_MAINTAINER_CHECK_COMMANDS}}
```

These checks validate: {{CHECK_SCOPE_AND_KNOWN_GAPS}}

## Uninstall and rollback

<!-- Use only removal and rollback commands verified for the installed host and source. -->

```sh
{{VERIFIED_UNINSTALL_COMMANDS}}
```

Uninstall removes: {{UNINSTALL_REMOVED_STATE}}

Uninstall does not remove or revert: {{UNINSTALL_PRESERVED_STATE}}

To roll back: {{ROLLBACK_SOURCE_STEPS_AND_VERIFICATION}}

## Limitations and failure recovery

| Limitation or failure           | Observable symptom | Safe recovery      |
| ------------------------------- | ------------------ | ------------------ |
| {{LIMITATION_OR_FAILURE_ONE}}   | {{SYMPTOM_ONE}}    | {{RECOVERY_ONE}}   |
| {{LIMITATION_OR_FAILURE_TWO}}   | {{SYMPTOM_TWO}}    | {{RECOVERY_TWO}}   |
| {{LIMITATION_OR_FAILURE_THREE}} | {{SYMPTOM_THREE}}  | {{RECOVERY_THREE}} |

{{ESCALATION_OR_STOP_CONDITION}}

## Documentation and support

<!-- Include only existing, maintained destinations. Use repository-relative links where appropriate. -->

- [{{PRIMARY_DOCUMENTATION_LABEL}}]({{PRIMARY_DOCUMENTATION_LINK}})
- [{{CHANGELOG_LABEL}}]({{CHANGELOG_LINK}})
- [{{SUPPORT_LABEL}}]({{SUPPORT_LINK}})
- [{{SECURITY_LABEL}}]({{SECURITY_LINK}})

{{SUPPORT_SCOPE_RESPONSE_EXPECTATIONS_AND_REQUIRED_DIAGNOSTICS}}

## License

{{LICENSE_NAME_AND_SCOPE}}. See [{{LICENSE_DOCUMENT_LABEL}}]({{LICENSE_DOCUMENT_LINK}}).

<!-- Keep only when third-party attribution or an independence statement is required. -->

{{ATTRIBUTION_AND_NON_AFFILIATION_STATEMENT}}
