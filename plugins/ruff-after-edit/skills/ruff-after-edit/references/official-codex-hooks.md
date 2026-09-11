# Official Codex Hooks Freshness Reference

Before proposing, creating, reviewing, or maintaining a consumer hook, verify
the current official [Codex Hooks documentation](https://learn.chatgpt.com/docs/hooks).
Confirm the selected event, matcher support, JSON input fields, stdout/stderr
contract, exit-code behavior, timeout, trust requirement, and the current
`hooks.json` / `config.toml` locations.

Revalidate after a Codex upgrade and whenever a generated hook behaves
differently from these references. Record the documentation access date in the
proposal. Treat this package as a decision aid, not a substitute for the
released Codex contract.

The current official contract establishes that command hooks receive JSON on
standard input; non-managed hooks require review and trust; and `Stop` requires
valid JSON on standard output when it exits successfully. Use the official page
as the source of truth if it conflicts with an example in this plugin.
