# `ruff-after-edit.sh` Reference

This is the required `PostToolUse` member of the Ruff hook pair. It must be
copied to a consumer-owned hooks directory only after approval. It never
belongs in a plugin `hooks/` directory and its presence alone does not grant
trust or activate it.

## Contract

The command accepts one required scope and an optional explicit Ruff
configuration:

```text
bash ruff-after-edit.sh --scope <absolute-directory> [--config <absolute-ruff-toml>]
```

- `--scope` is the approved project or directory boundary.
- Omit `--config` for Ruff defaults, an existing project configuration, or an
  approved adapted root `ruff.toml` / `pyproject.toml`; Ruff discovery remains
  authoritative.
- Pass `--config` only for the approved consumer-owned strict profile.
- The script reads the Codex `PostToolUse` payload from standard input and
  processes only an existing `.py` path reported in that payload and contained
  by `--scope`.
- The agent must select exactly one verified command route before writing the
  handler. It must use the same selection in the paired `Stop` handler.

## Ruff command route

Use the command route that the read-only assessment verifies:

| Verified environment                                                            | `run_ruff` implementation                                               |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Ruff is a dependency of an uv-managed project.                                  | `run_ruff() { uv run ruff "$@"; }`                                      |
| A project-local or `PATH` Ruff executable is the approved route.                | `ruff_bin="/absolute/path/to/ruff"`; `run_ruff() { "$ruff_bin" "$@"; }` |
| Ruff is not installed, and the user explicitly approves isolated uvx execution. | `run_ruff() { uvx ruff "$@"; }`                                         |

`uvx` may resolve or download a tool, so it is never inferred silently. Do not
combine routes, fall back automatically, or install anything from the hook.
For every route, the `config_args` array below is passed unchanged to safe lint,
formatting, final lint, and the paired `Stop` validation.

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
    *) printf '%s\n' "ruff-after-edit: invalid argument: $1" >&2; exit 2 ;;
  esac
done

[[ -n "$scope" && -d "$scope" ]] || { printf '%s\n' "ruff-after-edit: scope is unavailable" >&2; exit 2; }
[[ -z "$config" || -f "$config" ]] || { printf '%s\n' "ruff-after-edit: config is unavailable" >&2; exit 2; }
command -v jq >/dev/null 2>&1 || { printf '%s\n' "ruff-after-edit: jq is unavailable" >&2; exit 2; }

root="$(cd -P -- "$scope" && pwd -P)"
# Select exactly one verified implementation from the command-route table.
run_ruff() { uv run ruff "$@"; }
config_args=()
[[ -z "$config" ]] || config_args=(--config "$config")

while IFS= read -r file_path; do
  [[ "$file_path" == *.py ]] || continue
  candidate="$file_path"
  [[ "$candidate" = /* ]] || candidate="$root/$candidate"
  [[ -f "$candidate" ]] || continue
  target="$(cd -P -- "$(dirname -- "$candidate")" && pwd -P)/$(basename -- "$candidate")"
  case "$target" in "$root"/*) ;; *) continue ;; esac
  relative_path="${target#"$root"/}"

  run_ruff check "${config_args[@]}" --fix --no-unsafe-fixes -- "$relative_path"
  run_ruff format "${config_args[@]}" -- "$relative_path"
  run_ruff check "${config_args[@]}" -- "$relative_path"
done < <(
  jq -r '
    .tool_input.file_path?,
    .tool_input.path?,
    (.tool_input.command? // "" | split("\n")[] | select(test("^\\*\\*\\* (Add|Update) File: ")) | sub("^\\*\\*\\* (Add|Update) File: "; ""))
    | select(type == "string" and length > 0)
  ' < <(cat)
)
```

The script intentionally does not use `--unsafe-fixes`, `noqa`, `type: ignore`,
rule-selection flags, or additional ignores. A non-zero post-edit Ruff result
must be visible to Codex; the mandatory `Stop` script is what prevents clean
turn completion while diagnostics remain.

## Pairing requirement

Do not wire this script alone. The same hook source must also wire
[`ruff-check-on-stop.sh`](ruff-check-on-stop-script.md), with the identical
`--scope`, `--config`, and approved Ruff route.
