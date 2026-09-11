# 🛡️ Block No Verify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[← Back to Codex Essentials](../../README.md)

> Recommend and install a Codex Git bypass policy only after the user approves.

Block No Verify is a Codex skill plugin for a maintained Git verification and signing bypass policy. It does not install or enable a hook automatically.

Its bundled parser keeps shell-list, quoting, wrapper, and Git-option handling
in bounded helpers so strict Ruff complexity checks do not require suppressing
policy diagnostics.

## ⚡ Quick start

```bash
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add block-no-verify@codex-essentials
codex plugin list
```

Ask: `Use $block-no-verify to assess whether this repository should install the Git verification bypass policy.`

## 🎯 Use cases

| Scenario                                        | Result                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| Commit verification or signing bypasses matter. | A scoped policy recommendation, not an automatic configuration write. |
| A user approves project or user scope.          | Tested generated files and one merged handler pending user trust.     |

**Not a fit when:** server-side Git controls, branch protection, CI enforcement, or unrestricted shell evaluation are required.

## 🎯 Purpose

- Recommend a narrow policy for relevant commit, signing, bypass, or hook-policy work.
- Require explicit approval and project or user scope before target writes.
- Preserve existing hook sources and leave hook trust to the user.

## 🧰 Included Components

| Component                                                                  | Purpose                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Plugin manifest](.codex-plugin/plugin.json)                               | Identity, version, interface, and skill declaration.       |
| [Skill](skills/block-no-verify/SKILL.md)                                   | Approval-gated recommendation and installation workflow.   |
| [Agent metadata](skills/block-no-verify/agents/openai.yaml)                | Codex-facing discovery metadata.                           |
| [Installation contract](skills/block-no-verify/references/installation.md) | Scope, composition, test, trust, and rollback rules.       |
| [Templates](skills/block-no-verify/assets/templates/)                      | Python handler, project/user configuration, and Bash test. |
| [Changelog](CHANGELOG.md)                                                  | User-facing change history.                                |
| [License](LICENSE.md)                                                      | MIT terms.                                                 |

## 🖥️ Requirements and compatibility

## Supported Environments

| Requirement   | Supported value or behavior                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| Codex surface | Local clients supporting skills and synchronous `PreToolUse` command hooks.        |
| Runtime/tools | Python 3 for the handler and Bash for its maintenance test.                        |
| Project types | Git repositories for project scope; user-level Codex configuration for user scope. |
| Credentials   | None.                                                                              |
| Network       | Not used.                                                                          |
| Last verified | `2026-09-09` against Codex Hooks documentation and repository templates.           |

## 🔐 Behavior and boundaries

## Inputs and Outputs

**Inputs:** A Git-related request, selected scope, hook sources, and explicit approval.
**Outputs:** A recommendation, then approved generated files, a configuration merge, test result, and trust instructions.

## Required Tools and Credentials

No credential is required. A generated policy needs `python3`; its maintenance test needs Bash and `python3`.

## Permissions

| Access or effect | What this plugin may do                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Read             | Inspect approved hook configuration, payload contracts, and generated files. |
| Write            | After approval, create selected files and one merged handler group.          |
| Process          | After approval, run the generated Bash maintenance test.                     |
| Network          | Not used.                                                                    |
| Authentication   | Not required.                                                                |

## Side Effects

Plugin installation changes only Codex-managed plugin state and skill discovery. A separately approved installation can add files and a `PreToolUse` handler to the selected configuration.

## Human Approval Boundaries

The skill never silently installs the policy. It requires explicit approval and project or user scope before a configuration write. The user must review and trust the non-managed definition in `/hooks`.

## Installation Behavior

Plugin installation exposes the skill and templates only. It does not create `.codex/`, alter a repository, modify `~/.codex`, execute templates, or register an active lifecycle hook.

## 🔁 Uninstall and Rollback Behavior

```bash
codex plugin marketplace upgrade codex-essentials
codex plugin remove block-no-verify@codex-essentials
```

Removal stops skill discovery but does not remove a policy generated elsewhere. Remove only its handler group and generated files from the selected scope, or restore them from Git history.

## ✅ Verification

```bash
npx vitest run tests/block-no-verify-skill.test.ts
npm run marketplace:check
uvx ruff@0.16.6 check --isolated plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py
uvx ruff@0.16.6 format --isolated --check plugins/block-no-verify/skills/block-no-verify/assets/templates/block-no-verify.py
```

The focused test materializes the Python and Bash templates and runs the behavioral contract. It does not prove Codex discovery, trust, or live event execution.

## 🚧 Known Limitations

- The handler inspects literal Bash command text; it cannot resolve variables, aliases, `eval`, command substitutions, or opaque scripts.
- It covers supported Codex Bash tool calls, not remote Git policy, branch protection, server hooks, or CI controls.
- A passing template test does not make a target client trust or load a hook.

## Failure and Recovery

If the generated test fails, do not trust the changed policy. Restore known-good generated files and rerun after correcting the template or merge. If Codex does not list the hook, verify the selected source and inspect `/hooks`.

## 📚 Documentation and support

- [Skill workflow](skills/block-no-verify/SKILL.md)
- [Installation contract](skills/block-no-verify/references/installation.md)
- [Official Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks)
- [Changelog](CHANGELOG.md)
- [Codex Essentials marketplace](../../README.md)
- [Issues](https://github.com/nerymurillohnd/codex-essentials/issues)

## 📄 License

MIT. See [LICENSE.md](LICENSE.md). This independent community plugin is not endorsed by OpenAI.
