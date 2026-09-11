# 🧭 Prompt Architect

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Turn rough intent into a copy-ready, risk-calibrated prompt.

**Explore:** [Install](#-quick-start) · [Purpose](#-purpose) ·
[Environments](#supported-environments) · [Safety](#-behavior-and-boundaries) ·
[Docs](#-documentation-and-support)

Prompt Architect is a Codex plugin for people who need to write, improve, audit,
structure, or generate prompts for consequential work. Its self-contained skill
classifies risk, prompt density, domain, and execution topology; then it loads
only the routed references, packaged templates, examples, and delivery gates
needed to produce a copy-ready prompt.

It does not execute the prompt it creates, install tools, send data to a third
party, or modify the target project by itself.

It includes a packaged `Stop` hook that blocks malformed Prompt Architect final
output before delivery when Codex hook support is available. The validator
checks the outer response envelope without treating headings inside the generated
prompt as Prompt Architect sections, canonicalizes wrapper heading case, and
returns a repair reason through the hook continuation path when it blocks
delivery.

Its imports follow Ruff's canonical order so strict lint profiles can verify
the packaged validator without ignoring diagnostics.

The current plugin version is recorded in `.codex-plugin/plugin.json`. Install
the package from the repository's `main` catalog.

## ⚡ Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add prompt-architect@codex-essentials
codex plugin list
```

Then ask Codex:

```text
Use Prompt Architect to turn this rough task into a copy-ready Codex prompt.
```

## 🎯 Use cases

| Scenario                                         | How this plugin helps                                             | Expected result                                |
| ------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------- |
| A task is important but still vague.             | Identifies material gaps in scope, authority, output, and checks. | Focused questions or a ready prompt.           |
| An existing prompt is loose, unsafe, or bloated. | Audits ambiguity, authority, density, and completion gaps.        | A revised prompt with assumptions explicit.    |
| A task depends on current product or tool facts. | Routes to primary-source validation before finalizing the prompt. | A prompt based on current verified guidance.   |
| Work may benefit from parallel execution.        | Decides whether delegation is justified and bounds agent roles.   | A single-agent or controlled multi-agent plan. |

**Not a fit when:** the user only wants a direct answer, literal rewrite, or
ordinary explanation instead of prompt design or review.

## 🎯 Purpose

- Turn incomplete intent into the smallest prompt that closes material ambiguity.
- Keep authority, procedure, output, validation, and completion conditions
  explicit when the task warrants them.
- Check changing claims against official or primary sources before relying on
  them in a final prompt.
- Recommend model, reasoning effort, and execution topology separately from
  the generated prompt when those choices matter.
- Require a final self-audit before a prompt is described as ready.

## 🧰 Included Components

| Component                                                                                                              | Purpose                                                      |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)                                                               | Plugin identity, version, interface, and skill declaration.  |
| [`skills/prompt-architect/SKILL.md`](skills/prompt-architect/SKILL.md)                                                 | Authoritative routing, support-file map, and workflow.       |
| [`skills/prompt-architect/agents/openai.yaml`](skills/prompt-architect/agents/openai.yaml)                             | Codex-facing display and invocation metadata.                |
| [`hooks/hooks.json`](hooks/hooks.json)                                                                                 | Stop hook for final-output validation.                       |
| [`skills/prompt-architect/scripts/validate-final-output.py`](skills/prompt-architect/scripts/validate-final-output.py) | Outer-envelope final-output gate with repair diagnostics.    |
| [`skills/prompt-architect/references/`](skills/prompt-architect/references/)                                           | Normative procedures, domain guidance, and delivery gates.   |
| [`skills/prompt-architect/assets/templates/`](skills/prompt-architect/assets/templates/)                               | Compact, structured, operational, and critical prompt forms. |
| [`skills/prompt-architect/references/examples/`](skills/prompt-architect/references/examples/)                         | Calibration examples, prompt-audit reference, and scenarios. |
| [`CHANGELOG.md`](CHANGELOG.md)                                                                                         | User-facing change history.                                  |
| [`LICENSE.md`](LICENSE.md)                                                                                             | MIT license terms.                                           |

No MCP servers, apps, external services, or credentials are bundled.

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Codex surface | Codex hosts that support installed skills.                                                        |
| Runtime/tools | Codex skill support; Codex hook support for final-output validation.                              |
| Project types | Prompt authoring for coding, Git, research, writing, strategy, compliance, and operations.        |
| Credentials   | Not required.                                                                                     |
| Network       | Read-only official-source lookups when changing facts are material; no automatic remote mutation. |
| Last verified | `2026-09-06` against local plugin schemas and OpenAI Codex skill documentation.                   |

Current system instructions, project instructions, attached source material,
and official documentation take precedence over static package content.

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** rough task descriptions, existing prompts, transcripts, source
material, desired executor, constraints, approval boundaries, and target
environment.

**Outputs:** targeted clarification questions or a copy-ready prompt in the
conversation. When relevant, the response also gives separate execution
recommendations and current-guidance notes.

The skill is the orchestration contract. Its references, packaged templates,
examples, pressure scenarios, and final-output validator are intentionally
shipped under `skills/prompt-architect/` so the workflow is reproducible from
the installed package. `SKILL.md` routes those support files by condition so
ordinary prompts do not require loading the full reference set.

## Required Tools and Credentials

No credentials are required. The plugin uses Codex-provided web access only
when current official facts are material; do not provide secrets or private
source material to external sites.

## Permissions

| Access or effect | What this plugin may do                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| Read             | Read user-provided task material and packaged skill resources.              |
| Write            | None by default.                                                            |
| Process          | Run the packaged final-output validator on `Stop` when hooks are available. |
| Network          | Read official or primary sources when required to validate changing claims. |
| Authentication   | Not required.                                                               |

## Side Effects

Installing the plugin changes Codex-managed plugin state only. It does not
modify target repositories, project files, credentials, environments, or
external services.

## Human Approval Boundaries

Drafting an executor prompt does not authorize the current session to perform
the actions described by that prompt. File edits, commits, pushes, deployments,
external messages, credential access, production mutations, and destructive
operations still require explicit authorization in the executing session.

When a generated prompt mentions `/goal`, it is a destination-task instruction.
It does not create, resume, pause, or clear goals in the current task unless
the user separately asks for that action.

## Installation Behavior

Installation makes the `prompt-architect` skill available to Codex. It does
not install npm packages, alter lockfiles, configure MCP servers, or create
external accounts. It registers the packaged final-output hook declared in the
plugin manifest.

## 🔁 Uninstall and Rollback Behavior

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin list
codex plugin remove prompt-architect@codex-essentials
```

Uninstalling removes Codex-managed plugin state and cache. It does not delete
prompts, documents, repository changes, or other artifacts from prior sessions.
A previous package revision in Git is the recoverable rollback record.

## ✅ Verification

Maintainers can run the canonical package checks from the marketplace repository:

```bash
npm run validate:plugins
npm run marketplace:build
npm run marketplace:check
npm run documentation:gate -- --base main --head HEAD
uvx ruff@0.16.6 check --isolated plugins/prompt-architect/skills/prompt-architect/scripts/validate-final-output.py
uvx ruff@0.16.6 format --isolated --check plugins/prompt-architect/skills/prompt-architect/scripts/validate-final-output.py
npm run check
```

Consumer smoke test:

```text
Use Prompt Architect to draft a high-risk Codex prompt for recovering a Git stash. Ask only for missing material authority, then provide success conditions, authority gates, stop conditions, verification, and final reporting.
```

## 🚧 Known Limitations

- The skill improves prompt design; it cannot guarantee perfect downstream
  instruction following by every model or agent.
- A prompt cannot replace missing material facts or authority for high-risk
  work. The skill should ask focused questions or return Needs Clarification.
- Model, tool, API, product, and capability guidance can change. When current
  verification is unavailable, the prompt must label relevant assumptions.
- Multi-agent execution is conditional on destination support and task
  independence; a subscription tier alone does not establish availability.

## Failure and Recovery

If target, authority, required source, output, or verification criteria remain
materially unclear, the skill returns the smallest useful clarification set or
reports the blocker. It must not describe an incomplete prompt as ready.

## ❓ FAQ

<details>
<summary>Does installing this plugin modify the target project?</summary>

No. Installation changes Codex-managed plugin state only; it does not edit the
target project.
</details>

<details>
<summary>Does the skill include all of its working material?</summary>

Yes. Workflow resources are packaged inside `skills/prompt-architect/`.
</details>

<details>
<summary>Does every generated prompt include /goal or subagents?</summary>

No. Both are conditional controls used only when supported and beneficial.
</details>

## 📚 Documentation and support

- [Authoritative skill](skills/prompt-architect/SKILL.md)
- [Final-output hook](hooks/hooks.json)
- [Final-output validator](skills/prompt-architect/scripts/validate-final-output.py)
- [Prompt-engineering canon](skills/prompt-architect/references/00-prompt-engineering-canon.md)
- [Core prompt sections](skills/prompt-architect/references/05-core-sections.md)
- [Tool use rules](skills/prompt-architect/references/25-tool-use-rules.md)
- [Deviation and final reporting](skills/prompt-architect/references/45-deviation-final-report.md)
- [Current-guidance validation](skills/prompt-architect/references/60-current-guidance-validation.md)
- [Delegation and parallelism](skills/prompt-architect/references/70-delegation-parallelism.md)
- [Assembly and quality checks](skills/prompt-architect/references/95-assembly-quality-failures.md)
- [Goal-tracking guidance](skills/prompt-architect/references/100-goal-tracking.md)
- [Prompt templates](skills/prompt-architect/assets/templates/)
- [Calibration examples](skills/prompt-architect/references/examples/)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [OpenAI Build plugins documentation](https://learn.chatgpt.com/docs/build-plugins)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)
- [License](LICENSE.md)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md).

Prompt Architect is an independent community plugin and is not affiliated with
or endorsed by OpenAI.
