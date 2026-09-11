# `ruff-check-on-stop.sh` Reference

This is the mandatory `Stop` member of the Ruff hook pair. It is the gate that
prevents Codex from treating a turn as clean when Ruff still reports
violations. Copy it to a consumer-owned hooks directory only after approval.

## Contract

The command uses the same arguments and exactly the same selected Ruff route
as `ruff-after-edit.sh`:

```text
bash ruff-check-on-stop.sh --scope <absolute-directory> [--config <absolute-ruff-toml>]
```

The approved scope must be one of: the current user/global project directory,
the selected repository root, or an explicitly approved directory within that
repository. Selecting a narrow directory is required when pre-existing
violations elsewhere would otherwise make the gate chase unrelated legacy
work.

## Canonical Bash template

```bash
#!/usr/bin/env bash
set -uo pipefail

scope=""
config=""
while (($#)); do
  case "$1" in
    --scope) scope="${2:?missing scope}"; shift 2 ;;
    --config) config="${2:?missing config}"; shift 2 ;;
    *) printf '%s\n' "ruff-check-on-stop: invalid argument: $1" >&2; exit 2 ;;
  esac
done

[[ -n "$scope" && -d "$scope" ]] || { printf '%s\n' "ruff-check-on-stop: scope is unavailable" >&2; exit 2; }
[[ -z "$config" || -f "$config" ]] || { printf '%s\n' "ruff-check-on-stop: config is unavailable" >&2; exit 2; }

# Select the same verified implementation as ruff-after-edit.sh:
# uv run ruff, an approved absolute Ruff executable, or explicitly approved uvx ruff.
run_ruff() { uv run ruff "$@"; }
config_args=()
[[ -z "$config" ]] || config_args=(--config "$config")

if run_ruff check "${config_args[@]}" --force-exclude -- "$scope" >&2; then
  printf '{}\n'
  exit 0
fi
exit 2
```

`>&2` keeps the unresolved Ruff diagnostics visible to Codex, and `exit 2`
marks the `Stop` hook as blocking. The agent must resolve the reported
violations before it can finish the turn cleanly. This does not authorize a
weaker configuration, a whole-repository scan outside the approved scope, or
an automatic environment installation.

## Wiring requirement

Wire this script together with
[`ruff-after-edit.sh`](ruff-after-edit-script.md) in one selected consumer
source: `hooks.json` or inline `config.toml`, never both at the same scope.
The combined snippets are in:

- [Bundled strict profile wiring](bundled-strict-profile-hook-wiring.md)
- [Defaults and adapted configuration wiring](defaults-and-adapted-config-hook-wiring.md)
