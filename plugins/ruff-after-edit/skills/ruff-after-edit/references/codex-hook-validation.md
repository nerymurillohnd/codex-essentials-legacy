# Codex Hook Validation

Test consumer-owned hooks before trusting them. A parser check does not prove
discovery, trust, or a live Codex event.

## PostToolUse smoke test

Create an intentionally unformatted file inside the approved scope, pipe a
Codex-shaped `PostToolUse` payload, then inspect the result. Use the selected
command-route and optional `--config` arguments from the generated handler.

```bash
printf 'x= { "a":1}\n' > example.py
printf '%s\n' "{\"hook_event_name\":\"PostToolUse\",\"cwd\":\"$PWD\",\"tool_input\":{\"file_path\":\"$PWD/example.py\"}}" \
  | bash .codex/hooks/ruff-after-edit.sh --scope "$PWD"
cat example.py
```

For `apply_patch`, test a payload using `tool_input.command` with an
`*** Add File:` or `*** Update File:` line. Verify that only reported `.py`
paths inside `--scope` reach Ruff and that `--config` is present in every Ruff
phase when the strict `.codex/ruff.toml` profile was selected.

## Stop gate smoke test

Run the paired script against the same approved scope. A clean result must
exit `0` and emit valid JSON on standard output; remaining diagnostics must go
to standard error and the script must exit `2`.

```bash
bash .codex/hooks/ruff-check-on-stop.sh --scope "$PWD"
printf 'exit=%s\n' "$?"
```

Then add an unfixable Ruff violation, repeat the command, and confirm exit
`2`, diagnostics on standard error, and no policy bypass.

## Codex integration check

Validate the selected `hooks.json` or `config.toml`, restart or reload Codex,
inspect the exact source with `/hooks`, and let the user trust it. Test one
real Python edit and one real turn completion. Non-managed hooks do not run
until they are reviewed and trusted.
