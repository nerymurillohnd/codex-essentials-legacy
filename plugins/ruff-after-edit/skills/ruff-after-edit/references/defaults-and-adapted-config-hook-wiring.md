# Ruff Defaults and Adapted Configuration Hook Wiring

Use this reference when the user explicitly selects Ruff defaults or an
adapted project-owned Ruff configuration. These are wiring examples only: they
do not create, activate, or trust a hook.

`PostToolUse` and `Stop` are one required pair. Copy both approved Bash
handlers and wire both events in the selected representation. The `Stop`
handler must run the final approved-scope Ruff check, send diagnostics to
standard error, and exit `2` while unresolved violations remain.

Choose one configuration representation per scope: `hooks.json` **or** the
inline hook tables in `config.toml`. Never add both to the same scope.

## Ruff defaults

Ruff defaults require no configuration file and no `--config` argument.

### User/global `~/.codex/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.codex/hooks/ruff-after-edit.sh\" --scope \"$PWD\"",
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
            "command": "bash \"$HOME/.codex/hooks/ruff-check-on-stop.sh\" --scope \"$PWD\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### User/global `~/.codex/config.toml`

```toml
[[hooks.PostToolUse]]
matcher = "Write|Edit|apply_patch"

[[hooks.PostToolUse.hooks]]
type = "command"
command = 'bash "$HOME/.codex/hooks/ruff-after-edit.sh" --scope "$PWD"'
timeout = 30

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = 'bash "$HOME/.codex/hooks/ruff-check-on-stop.sh" --scope "$PWD"'
timeout = 30
```

### Project `<repo>/.codex/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh\" --scope \"$(git rev-parse --show-toplevel)\"",
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
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh\" --scope \"$(git rev-parse --show-toplevel)\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Project `<repo>/.codex/config.toml`

```toml
[[hooks.PostToolUse]]
matcher = "Write|Edit|apply_patch"

[[hooks.PostToolUse.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh" --scope "$(git rev-parse --show-toplevel)"'
timeout = 30

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh" --scope "$(git rev-parse --show-toplevel)"'
timeout = 30
```

## Adapted project configuration

An adapted configuration is project-owned. The agent must inspect existing
`pyproject.toml`, `ruff.toml`, and `.ruff.toml` files, show the exact proposed
content, and receive approval before writing anything. It must not weaken an
existing policy or overwrite an existing Ruff configuration.

When the approved configuration is written to `<repo>/ruff.toml` or the
existing `<repo>/pyproject.toml`, Ruff discovers it normally. Do not pass
`--config`; it would be redundant and can override the project’s intended
discovery behavior.

### Project `<repo>/.codex/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh\" --scope \"$(git rev-parse --show-toplevel)\"",
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
            "command": "bash \"$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh\" --scope \"$(git rev-parse --show-toplevel)\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Project `<repo>/.codex/config.toml`

```toml
[[hooks.PostToolUse]]
matcher = "Write|Edit|apply_patch"

[[hooks.PostToolUse.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-after-edit.sh" --scope "$(git rev-parse --show-toplevel)"'
timeout = 30

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = 'bash "$(git rev-parse --show-toplevel)/.codex/hooks/ruff-check-on-stop.sh" --scope "$(git rev-parse --show-toplevel)"'
timeout = 30
```

## Final review

For either mode, verify the Bash handler path, preserve unrelated hook groups,
choose only one hook representation in the selected scope, and let the user
inspect and trust the resulting definition in `/hooks`.
