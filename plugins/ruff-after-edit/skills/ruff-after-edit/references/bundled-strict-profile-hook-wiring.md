# Bundled Strict Profile Hook Wiring

Use this reference only when the user explicitly selects the bundled strict
Ruff profile. The agent must first copy the approved profile to a
consumer-owned path and copy the approved Bash handler to the matching hooks
directory. These are examples only: they do not activate, trust, or create a
hook.

`PostToolUse` and `Stop` are one required pair. Copy both approved Bash
handlers and wire both events in the selected representation. The `Stop`
handler must run the final project check, send diagnostics to standard error,
and exit `2` while Ruff reports unresolved violations.

Choose one configuration representation per scope: `hooks.json` **or** the
inline hook tables in `config.toml`. Never add both to the same scope.

## User/global scope

Before using either snippet, the approved files must be:

```text
~/.codex/ruff.toml
~/.codex/hooks/ruff-after-edit.sh
~/.codex/hooks/ruff-check-on-stop.sh
```

### `~/.codex/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.codex/hooks/ruff-after-edit.sh\" --scope \"$PWD\" --config \"$HOME/.codex/ruff.toml\"",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.codex/hooks/ruff-check-on-stop.sh\" --scope \"$PWD\" --config \"$HOME/.codex/ruff.toml\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### `~/.codex/config.toml`

```toml
[[hooks.PostToolUse]]
matcher = "Write|Edit|apply_patch"

[[hooks.PostToolUse.hooks]]
type = "command"
command = 'bash "$HOME/.codex/hooks/ruff-after-edit.sh" --scope "$PWD" --config "$HOME/.codex/ruff.toml"'
timeout = 30

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = 'bash "$HOME/.codex/hooks/ruff-check-on-stop.sh" --scope "$PWD" --config "$HOME/.codex/ruff.toml"'
timeout = 30
```

## Project/repository scope

Before using either snippet, the approved files must be:

```text
<repo>/.codex/ruff.toml
<repo>/.codex/hooks/ruff-after-edit.sh
<repo>/.codex/hooks/ruff-check-on-stop.sh
```

### `<repo>/.codex/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh\" --scope \"$(git rev-parse --show-toplevel)\" --config \"$(git rev-parse --show-toplevel)/.codex/ruff.toml\"",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh\" --scope \"$(git rev-parse --show-toplevel)\" --config \"$(git rev-parse --show-toplevel)/.codex/ruff.toml\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### `<repo>/.codex/config.toml`

```toml
[[hooks.PostToolUse]]
matcher = "Write|Edit|apply_patch"

[[hooks.PostToolUse.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh" --scope "$(git rev-parse --show-toplevel)" --config "$(git rev-parse --show-toplevel)/.codex/ruff.toml"'
timeout = 30

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh" --scope "$(git rev-parse --show-toplevel)" --config "$(git rev-parse --show-toplevel)/.codex/ruff.toml"'
timeout = 30
```

## Final review

Confirm that the selected scope does not already contain the other hook
representation, that all placeholder paths have been resolved, and that the
user reviews the exact definition in `/hooks` before trusting it.
