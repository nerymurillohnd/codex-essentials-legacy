---
name: block-no-verify
description: Recommend and, only with approval, install and maintain a Codex hook that blocks Git --no-verify, --no-gpg-sign, and falsy commit.gpgsign bypasses. Use for Git commit, signing, hook-policy, or verification-bypass work; do not invoke for ordinary read-only Git inspection.
metadata:
  short-description: Install an approval-gated Git bypass policy
---

# Block No Verify

Help the user decide whether to install a narrowly scoped Codex Git protection.
Installing this plugin only makes this skill discoverable. It does not install
or enable a hook automatically.

## Recommend, do not impose

When commit verification, commit signing, a bypass flag, or a Git hook policy is
material to the task, make one concise recommendation. State that the generated
policy blocks `--no-verify`, `--no-gpg-sign`, and falsy `commit.gpgsign` command
configuration for supported Codex Bash calls.

Do not recommend the policy merely because the user is reading Git state, such
as with `git status`, `git log`, or branch inspection.

## Approval gate

Before creating or modifying any target configuration, obtain **explicit
approval** to install the policy. Then establish **project or user scope**:

- Project scope applies only to the selected repository.
- User scope applies to the user's Codex hook configuration and can affect
  multiple repositories.

Read [the installation reference](references/installation.md) only after the
user approves installation. Follow its source-inventory, merge, template,
testing, trust, and rollback requirements exactly. Do not silently replace an
existing hook source or trust a hook for the user.

## Boundaries

- The generated hook is a synchronous `PreToolUse` policy for `^Bash$`; it is
  not a Git hook, an approval bypass, or a universal endpoint-control mechanism.
- It fails closed for corrupt payloads or shell syntax it cannot parse. A valid
  payload without `tool_input.command` is allowed because there is no command to
  inspect.
- It does not evaluate shell variables, aliases, `eval`, command substitutions,
  or opaque scripts that later invoke Git. State this limitation whenever it
  affects the user's security expectation.
- The generated Python handler is run via `python3`. Mark only the generated
  Bash maintenance test executable before running it.

## Report

Report the selected scope, all inspected and changed hook sources, copied
template paths, test result, and `/hooks` review/trust action still owned by the
user. Separate parsing, behavioral testing, discovery, trust, and live
integration evidence; do not claim an unobserved level passed.
