# Block No Verify Installation Contract

Read this reference only after the user gives explicit approval to install the
policy and selects project or user scope.

## Inventory before changing configuration

Inspect applicable project and user `hooks.json` and `config.toml` sources,
enabled plugin hooks, managed-hook policy, and `/hooks` when available. Record
the event, matcher, command, timeout, source, and trust state for each match.
Hook sources compose; never replace an event array or a whole configuration file
merely to add this policy.

## Select the target paths

For project scope, create `<repository>/.codex/hooks/block-no-verify.py` and
`<repository>/.codex/hooks/test-block-no-verify.sh`. Merge the handler from
`assets/templates/project-hooks.json` into the selected project source. Its
command resolves the handler from the Git root.

For user scope, create `~/.codex/hooks/block-no-verify.py` and
`~/.codex/hooks/test-block-no-verify.sh`. Merge the handler from
`assets/templates/user-hooks.json` into the selected user source. If the chosen
layer uses inline TOML hooks, integrate the same handler fields there instead of
creating a competing `hooks.json` source.

## Copy, merge, and test

Copy the Python and Bash templates to the selected hook directory. Merge exactly
one synchronous `PreToolUse` matcher group for `^Bash$`, preserving unrelated
events, matchers, handlers, ordering, and metadata. Mark and run only the Bash
test as executable:

```sh
chmod u+x test-block-no-verify.sh
./test-block-no-verify.sh
```

The test invokes the handler with `python3`; do not make the Python file
executable solely for this test. A passing test proves template behavior, not
Codex discovery, trust, or live event execution.

## Activation and rollback

Ask the user to inspect the exact source and trust state in `/hooks`. The user,
not the skill, decides whether to trust the non-managed hook. Exercise one
blocked command and one nearby allowed command only after trust is visible.

To roll back, remove only the added handler group and generated files from the
selected scope. Removing this plugin later does not remove a hook generated in
another repository or user configuration.

## Coverage limitations

The handler sees literal Codex Bash command text. It cannot resolve variables,
aliases, `eval`, command substitutions, or another executable's later Git
invocation. It is not a replacement for Git server controls, branch protection,
or repository CI.
