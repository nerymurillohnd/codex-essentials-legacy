# Block No Verify Design

## Status

Approved for implementation on 2026-09-09. This specification defines a
marketplace skill, not an automatically active lifecycle hook.

## Purpose

`block-no-verify` helps a Codex user install and maintain a project- or
user-scoped `PreToolUse` policy that rejects Git commit-verification and signing
bypasses. The distributed plugin provides the operating workflow and
self-contained templates; it never installs, enables, trusts, or executes that
policy merely because the plugin is installed.

## Scope

The package will contain:

- a `.codex-plugin/plugin.json` authored from the repository manifest template;
- a `block-no-verify` skill and Codex-facing agent metadata;
- a Python hook template that consumes a Codex `PreToolUse` Bash payload;
- project- and user-scope hook-configuration templates;
- the supplied Bash maintenance test template;
- focused installation and trust guidance;
- a plugin `README.md`, `CHANGELOG.md`, and `LICENSE.md`, each authored from
  its matching repository template;
- generated `.agents/plugins/marketplace.json` registration; and
- repository tests that exercise the distributed templates from a temporary
  installation location.

The package will not declare a plugin `hooks` component or create a
`hooks/` directory at its root. It will not alter any target repository or
user-level Codex configuration until a user explicitly approves installation
within a later skill invocation.

## User experience

The skill may be implicitly selected for commit, commit-signing, hook-policy,
or verification-bypass work. It should make one concise recommendation when
that protection is relevant, rather than interrupting ordinary read-only Git
operations.

Before any install, the skill must:

1. explain that installation changes Codex hook configuration;
2. request explicit approval;
3. establish project versus user scope;
4. inspect all applicable existing hook sources and their composition; and
5. state the intended files, test command, trust step, and rollback path.

After approval, it creates the hook and `test-block-no-verify.sh` beside it,
merges only the matching new `PreToolUse` handler into the selected
configuration, marks the Bash test executable, runs it, and directs the user to
review and trust the exact definition in `/hooks`. Project scope resolves the
handler from the Git root; user scope uses the selected absolute user-level
hook path. The Python hook is invoked through `python3` and does not require an
executable mode bit.

## Generated hook behavior

The generated configuration uses a synchronous `PreToolUse` matcher of
`^Bash$`. The stdlib-only Python handler emits Codex's structured deny response
for direct, chained, and supported-wrapper invocations of Git that use:

- `--no-verify`;
- `--no-gpg-sign`; or
- `-c` or `--config` values that set `commit.gpgsign` to `false`, `no`, `off`,
  or `0`, case-insensitively.

The handler accepts ordinary Git commands and commit messages that only mention
a forbidden flag as text. It fails closed for corrupt payloads or parser
failures, while a valid payload without a command remains allowed. It preserves
the scope boundary of static command inspection: it cannot resolve shell
variables, aliases, `eval`, or opaque external scripts that later invoke Git.

## Template verification

The Bash test template supplied by the user is the maintenance contract. It
must cover direct and chained commands, `sudo`, `env`, `nice`, `nohup`,
`timeout`, `xargs`, `command`, `builtin`, `noglob`, `watch`, leading variable
assignments, case variants, all declared falsy `commit.gpgsign` values, normal
Git commands, malformed JSON, and a valid payload without `tool_input.command`.

Repository tests will materialize the Python and Bash templates in a temporary
directory, execute the Bash test, and assert that it exits successfully. They
will also assert that the package manifest declares only `./skills/` and that
the package contains no active hook configuration.

## Compatibility and safety

The package follows the repository's current `.codex-plugin/plugin.json`
compatibility-manifest pipeline. It remains self-contained and dependency-free
at runtime except for Python 3 and Bash when the generated maintenance test is
run. Generated hook installation remains subject to the target Codex host's
hook discovery and user trust state.

The plugin package documents its own installation, purpose, included assets,
permissions, side effects, approval boundaries, rollback, verification, and
known limitations. The root `README.md` adds `block-no-verify` to the plugin
catalog, the matching use-case table, and keyword navigation, using the
repository's existing entry structure. The marketplace catalog is generated
from the authored manifest rather than edited directly.

## Acceptance criteria

- Installing the marketplace plugin adds only skill discoverability.
- A relevant request causes the skill to recommend, not silently install, the
  protection.
- The skill requires explicit approval and scope selection before any target
  configuration write.
- Generated hook and maintenance test pass the supplied behavior matrix.
- The generated hook uses Codex `PreToolUse` structured-deny output.
- The manifest, plugin README, changelog, license, skill metadata, root README
  entries, and generated marketplace catalog are all present and consistent.
- Each created package document begins from its matching repository template,
  with unsupported placeholders and sections removed.
- The plugin passes package validation, catalog generation, documentation gate,
  targeted behavioral tests, Python diagnostics, and the repository check.
