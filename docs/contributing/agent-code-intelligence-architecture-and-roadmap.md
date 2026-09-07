# Agent Code Intelligence: Architecture and Implementation Roadmap

Status: proposed implementation contract; no plugin implementation is claimed.

Research date: 2026-09-06.

Repository baseline: `1738eb7eecbeccc14d6871470dfa075c22a31e52`.

Initial host qualification baseline: Codex CLI `0.153.4` and the installed macOS
desktop client. A source inspection of upstream `main` is supporting evidence,
not proof of installed-client behavior.

This contributor-facing plan is stored here at the owner's explicit request.
It supersedes the conversational proposal, including its assumptions about
repository-owned LSP dependencies and implicit MCP environment interpolation.
Unchecked tasks below are implementation obligations, not research results.

## 1. Objective and Accepted Decisions

Build `code-intelligence`, a distributable Codex Essentials plugin that equips
the agent with independent, recoverable code-analysis tools. It must work inside
different projects without adding its tools to those projects, replacing their
compilers, changing their scripts, or repeatedly running their complete gates.

The first provider catalog contains exactly these selectable LSP providers:

| Provider ID    | Primary engine          | Additional provider dependencies                                                                        |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `typescript`   | TypeScript 7 native LSP | Native platform binary                                                                                  |
| `basedpyright` | Basedpyright LSP        | uv-managed Python installation; packaged Node dependency as required by the distribution                |
| `svelte`       | Svelte Language Server  | Its compatible JavaScript TypeScript/compiler dependencies; included stable svelte-check scan companion |
| `shell`        | Bash Language Server    | ShellCheck for lint diagnostics; shfmt for proposed formatting                                          |
| `ruff`         | Ruff native LSP         | The same Ruff binary supplies lint and format CLI operations                                            |

The installation skill asks which providers the user wants. It explains and
installs their dependency closure, records selections, and can restore them after
machine loss. Installing the plugin and provisioning its tools are distinct,
observable steps. Normal diagnosis never downloads or upgrades software.

macOS ARM64 is the primary qualification target; macOS x64 and Linux ARM64/x64
have explicit platform adapters and CI qualification. Linux means glibc-based
environments in v1. Unsupported libc/architecture combinations fail explicitly.
Windows, Astro, notebooks, and additional LSP providers are outside v1. ShellCheck
and shfmt are dependencies of the shell provider, not additional LSP providers.

The agent must obtain diagnostics, correct reported errors and warnings in the
affected task scope, and obtain fresh diagnostics after corrections. Hooks must
block unrelated progression and completion while this evidence is missing or
unclean. Information and hints remain visible but do not independently block.
There is no authentication requirement for local code diagnosis.

### 1.1 Runtime Independence Versus Analysis Context

The plugin owns analyzer installations and versions. The subject project owns
the source being interpreted: imports, declarations, target Python, tsconfig,
preprocessors, and framework semantics. Reading those inputs does not make the
analyzer a project dependency. Never switch to a repository's analyzer binary
merely because it exists, and never rewrite project settings to obtain green.

Default analysis respects existing subject configuration. With none, use the
selected engine's stable defaults and report them. A stricter profile is a
separately selected audit policy; it must not be silently substituted during a
normal correction task. In particular, `ruff --select ALL` is not a default.

Rationale: independent tools add capability while preserving semantic meaning.
Sources: [S5], [S6], [S7], [S8].

## 2. Evidence and Source Register

Sources were accessed on 2026-09-06 unless stated otherwise. Versioned links
govern the selected engine; unversioned documentation must be rechecked when
updating the lock. All performance targets in this plan are acceptance budgets,
not measured promises about every repository.

| ID  | Primary source or local authority                                                                                                                                                                                                                                                                                                                                 | Relevant contract                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| S1  | [Codex plugin packaging](https://developers.openai.com/plugins/build/plugins)                                                                                                                                                                                                                                                                                     | Manifest, bundled MCP, lifecycle hooks, marketplace distribution                  |
| S2  | [Codex hooks](https://learn.chatgpt.com/docs/hooks)                                                                                                                                                                                                                                                                                                               | Event payloads, trust, blocking output, concurrency and coverage limits           |
| S3  | [MCPLS v0.5.0 configuration](https://github.com/bug-ops/mcpls/blob/v0.5.0/docs/user-guide/configuration.md)                                                                                                                                                                                                                                                       | Routing, environment, timeouts, workspace limits                                  |
| S4  | [MCPLS v0.5.0 client](https://github.com/bug-ops/mcpls/blob/v0.5.0/crates/mcpls-core/src/lsp/client.rs) and [release commit](https://github.com/bug-ops/mcpls/commit/bfd4d62cdd3adde6123cf0ab4398cf4fbd0af1f1)                                                                                                                                                    | Null configuration replies, versioned behavior and diagnostic recovery            |
| S5  | [TypeScript 7.0.2 release](https://github.com/microsoft/TypeScript/releases/tag/v7.0.2), [matching native LSP source](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/cmd/tsgo/lsp.go), [native server](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/lsp/server.go) | Native LSP, automatic type acquisition, configuration                             |
| S6  | [Basedpyright v1.39.10 CLI](https://github.com/DetachHead/basedpyright/blob/v1.39.10/docs/configuration/command-line.md), [LSP settings](https://docs.basedpyright.com/latest/configuration/language-server-settings/)                                                                                                                                            | CLI JSON, baseline behavior, interpreter and settings ownership                   |
| S7  | [Ruff migration](https://docs.astral.sh/ruff/editors/migration/), [configuration and discovery](https://docs.astral.sh/ruff/configuration/), [LSP settings](https://github.com/astral-sh/ruff/blob/0.16.6/docs/editors/settings.md)                                                                                                                               | Native server, settings migration, discovery, precedence                          |
| S8  | [Ruff linter](https://docs.astral.sh/ruff/linter/), [formatter](https://docs.astral.sh/ruff/formatter/)                                                                                                                                                                                                                                                           | Diagnostics, proposed fixes, format checks and incompatible rule selections       |
| S9  | [Svelte LSP package](https://github.com/sveltejs/language-tools/blob/master/packages/language-server/package.json), [server](https://github.com/sveltejs/language-tools/blob/master/packages/language-server/src/server.ts), [svelte-check](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md)                               | Compiler dependencies, pull diagnostics, trust and CLI framing                    |
| S10 | [Bash LSP settings](https://github.com/bash-lsp/bash-language-server/blob/server-5.6.0/server/src/config.ts), [ShellCheck integration](https://github.com/bash-lsp/bash-language-server/blob/server-5.6.0/server/src/shellcheck/index.ts)                                                                                                                         | Configuration, dialect, missing linter behavior and push diagnostics              |
| S11 | [ShellCheck manual](https://github.com/koalaman/shellcheck/blob/v0.11.0/shellcheck.1.md), [shfmt 3.14.1](https://github.com/mvdan/sh/releases/tag/v3.14.1)                                                                                                                                                                                                        | JSON1, shell dialects, heredoc fixes and formatting                               |
| S12 | [MCP SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/), [protocol negotiation](https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions.html), [gateway guidance](https://ts.sdk.modelcontextprotocol.io/v2/advanced/gateway.html)                                                                                                                           | Supported MCP implementation, legacy connection without discovery subprocesses    |
| S13 | [Agent Skills specification](https://agentskills.io/specification), [local package rules](../../plugins/AGENTS.md), [submission workflow](plugins.md)                                                                                                                                                                                                             | Skill metadata, package containment and generated catalog                         |
| S14 | [MCPLS tools](https://github.com/bug-ops/mcpls/blob/v0.5.0/docs/user-guide/tools-reference.md), [troubleshooting](https://github.com/bug-ops/mcpls/blob/v0.5.0/docs/user-guide/troubleshooting.md)                                                                                                                                                                | Edit plans, cached diagnostics, external changes and lifecycle                    |
| S15 | [Codex MCP plugin parser](https://github.com/openai/codex/blob/main/codex-rs/codex-mcp/src/plugin_config.rs), [plugin loader](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/loader.rs)                                                                                                                                                      | Relative cwd normalization; do not infer environment expansion from hook examples |

### 2.1 Research Results, Not Plugin Acceptance

| Experiment                                           | Observed result                                                             | Limit                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Installed native TypeScript `7.0.2`, `--lsp --stdio` | In-memory TS2322 diagnosis; native capabilities and UTF-16 reported         | Not a plugin installation test                                           |
| MCPLS `0.3.9` to native TS7                          | Document symbols and clean-file diagnosis worked                            | Shutdown with null parameters failed and forced process termination      |
| Svelte LSP `0.18.4`                                  | TS2322 appeared, then cleared after versioned didChange; clean shutdown     | Untrusted fallback probe was not full Svelte 5 qualification             |
| Basedpyright `1.39.10` CLI                           | `--baselinemode discard --outputjson` accepted; JSON diagnosis available    | Hostile configuration and baseline preservation remain integration tests |
| Ruff `0.16.6` via stdin                              | I001/F401/F821 and safe edit proposals; corrected input returned empty JSON | Does not prove directory-discovery coverage                              |
| ShellCheck `0.11.0` via stdin                        | POSIX-invalid syntax produced SC3010/SC3014; correction cleared findings    | Does not prove all Bash LSP settings are delivered                       |
| Existing user MCPLS configuration                    | Missing old Node paths; MCP handshake still succeeded despite LSP failures  | Demonstrates why tool discovery is not a health gate                     |

The supplied Basedpyright 1.21.1 pages are historical evidence of CLI/LSP
capabilities and additional rules, not the selected installation version:
[rules](https://docs.basedpyright.com/v1.21.1/benefits-over-pyright/new-diagnostic-rules/),
[CLI](https://docs.basedpyright.com/v1.21.1/configuration/command-line/),
[settings](https://docs.basedpyright.com/v1.21.1/configuration/language-server-settings/).
The supplied [SitePoint RC article](https://www.sitepoint.com/typescript-70-rc-the-go-rewrite-migration-guide/)
is discovery context only. Stable TypeScript 7 command names and behavior come
from S5 and executable probes; no RC migration instructions are applied to a
subject project.

## 3. Architecture and Why Each Layer Exists

```text
Codex skills and supported tools
  | MCP stdio                         | lifecycle events
  v                                   v
plugin gateway                   command-hook controller
  |                                   |
  +---- atomic workspace/session evidence store ----+
  |
  +-- typed CLI diagnostic adapters
  |
  +-- lazy MCPLS instance per provider/language context
        |
        +-- framed LSP adapter: settings, lifecycle, observation
              |
              +-- independently installed analyzer
```

The gateway is the public MCP endpoint and owns provider aggregation, coverage,
evidence, and bounded process management. MCPLS retains the existing semantic
tool translation. The LSP adapter supplies missing settings, fixes narrowly
reproduced wire incompatibilities, and observes versioned diagnostics needed by
the gate. None of these layers implements a type checker or duplicates the
language engines.

Directly exposing unmodified MCPLS was rejected: one Python diagnostic route
cannot simultaneously own Basedpyright and Ruff, configuration requests receive
null, and cached emptiness cannot prove current analysis. Replacing MCPLS with a
new universal LSP implementation was rejected as unnecessary translation work.
A permanent upstream fork is not part of v1. Compatibility transforms are small,
version-scoped, tested, and removable when upstream supplies equivalent behavior.
Sources and rationale: S3, S4, S12, S14.

### 3.1 Package Boundary

The package root is `plugins/code-intelligence/`:

```text
.codex-plugin/plugin.json
.mcp.json
README.md, CHANGELOG.md, LICENSE.md, THIRD_PARTY_NOTICES.md
package.json, package-lock.json
runtime/bootstrap.sh, runtime/bootstrap-lock.sh
runtime/launch.sh, runtime/cli.mjs, runtime/server.mjs
runtime/lib/{context,evidence,providers,lsp-adapter,cli-adapters,gate}/
hooks/hooks.json, hooks/dispatch.sh
providers/{typescript,basedpyright,svelte,shell,ruff}.json
platforms/{darwin,linux}.mjs
config/{settings.schema.json,provider.schema.json,toolchain.lock.json,templates}/
skills/{setup-code-intelligence,diagnose-and-fix,semantic-navigation,maintain-code-intelligence}/
tests/{unit,protocol,providers,hooks,installation,fixtures}/
docs/{architecture,tools,installation,recovery,compatibility,security}.md
```

All four skills have their own `agents/openai.yaml` and direct references.
Provider-specific references remain inside the owning skill. Shared executable
implementations are package-local runtime modules; the plugin does not import
repository maintenance code. Build dependencies are private to this package.
Ship the built gateway with its JavaScript dependencies bundled and notices
preserved; package installation must not depend on an implicit npm install hook.

Persistent state uses one deterministic user location shared by hooks, CLI, and
MCP: macOS `$HOME/Library/Application Support/Codex Code Intelligence`; Linux
`${XDG_DATA_HOME:-$HOME/.local/share}/codex-code-intelligence`. It contains
`settings.json`, `installations/`, `receipts/`, `workspaces/`, `sessions/`,
`staging/`, and `restore-manifest.json`. Source packages are not rewritten.

This deliberately avoids assuming legacy bundled MCP receives the same
`PLUGIN_DATA` environment as command hooks. The host's data directory remains
host-owned; this plugin's named external data directory is explicitly declared
and owner-marked. Amend the local containment policy narrowly before implementing
this layout: package code/resources stay contained; declared, validated user
runtime state and provisioned executables are a distinct ownership class. Do not
silently bypass the existing validator or generalize this to arbitrary paths.

### 3.2 Concrete MCP Bootstrap

Use this authored companion shape, subject to the mandatory installed-host test:

```json
{
  "code_intelligence": {
    "command": "sh",
    "args": ["./runtime/launch.sh", "serve"],
    "cwd": "."
  }
}
```

`cwd` is the package location, not the analyzed workspace. Codex's native parser
normalizes relative cwd against plugin root (S15). The repository currently
rejects this field in its MCP validator; add only the supported contained `cwd`
contract, with positive and negative tests. Do not assume `${PLUGIN_ROOT}` is
interpolated in a legacy `.mcp.json` merely because it works in hook commands.
Hooks invoke `sh "${PLUGIN_ROOT}/hooks/dispatch.sh"` using documented hook
environment support (S1, S2).

The launcher resolves its package root from its own location and reads the
owned installation receipt to locate Node. It never selects a subject
`node_modules/.bin` or sources a subject shell file. Missing setup is a clear
nonzero error with the setup-skill instruction. The shell hook wrapper can emit
blocking output when Node is missing. No startup path performs provisioning.

First installation has a separate Node-free entrypoint:
`bash <package>/runtime/bootstrap.sh inventory|install`. It supports the macOS
system Bash 3.2 and Linux Bash, and requires only curl, tar, uname, mktemp, core
filesystem utilities, and shasum or sha256sum. It reads only the package's generated
shell-safe bootstrap lock, never evaluates remote text or parses JSON with grep.
It prints missing prerequisites and exits before mutation if any are unavailable.
The setup skill presents this inventory and the selected installation plan first.
Bootstrap verifies fixed NVM/Node/uv artifacts, preserves existing installations,
places Node in the NVM version layout without changing an existing default alias,
and records private bootstrap paths before handing off to the typed JS installer.
Only explicitly requested bootstrap may provision; the ordinary launcher cannot
invoke it. No Python, Node, npm or uv installation is assumed for this first step.

The analyzed root comes exclusively from a hook-created context and an explicit
`begin_diagnostic_task` call. This prevents an MCP process launched in its package
directory from accidentally analyzing the plugin or the user's entire home.

### 3.3 Initial Dependency Lock Policy

| Component                | Initial version | Installation policy                                                  |
| ------------------------ | --------------- | -------------------------------------------------------------------- |
| MCPLS                    | `0.5.0`         | Official per-platform artifact, verified SHA256                      |
| MCP server/client SDK    | `2.0.0` each    | Exact package-local build dependencies; legacy mode toward MCPLS     |
| vscode-jsonrpc           | `9.0.2`         | Framed LSP adapter dependency                                        |
| TypeScript native        | `7.0.2`         | Private npm prefix and platform package; no global tsc replacement   |
| Basedpyright             | `1.39.10`       | Dedicated uv environment/tool directory                              |
| Ruff                     | `0.16.6`        | Dedicated uv tool directory; no legacy ruff-lsp                      |
| Svelte Language Server   | `0.18.4`        | Private npm prefix and complete dependency lock                      |
| Svelte JS TypeScript SDK | `6.0.3`         | Isolated dependency of the Svelte provider, never TS native fallback |
| svelte-check             | `4.7.6`         | Included with the Svelte provider as a stable CLI companion          |
| Bash Language Server     | `5.6.0`         | Private npm prefix                                                   |
| ShellCheck               | `0.11.0`        | Official native artifact                                             |
| shfmt                    | `3.14.1`        | Official native artifact; includes current heredoc corrections       |

Use Node `24.20.0` under NVM and uv-managed Python `3.14` for the initial machine
profile. Setup records the exact Python patch/build and uv version selected by
its platform lock. Before publishing, lock every transitive npm/Python package,
platform asset URL, integrity digest, runtime build, and license; reject missing
entries. The implementation task generates and verifies those machine-readable
locks from official metadata rather than copying unverified checksums into this
plan. A missing asset is a release failure, not permission to use `latest`.

Updates are separate transactions: download to staging, verify, run canaries,
switch the active receipt atomically, retain the previous installation. No
concurrent session changes its engine midway through an analysis generation.

## 4. Context, Scope, State, and Concurrency Contracts

### 4.1 Identity and Storage

`SessionStart` creates an owner-only context record keyed by host session ID and
canonical cwd. It returns an opaque `context_id` in concise model context.
`begin_diagnostic_task` requires that ID and explicit target files; the gateway
looks up the root and does not accept a replacement root from the caller.

Every public tool accepts `context_id` and a reserved `admission_id`. The
PreToolUse hook derives context from its host event, rejects a supplied context
belonging to another session, and injects a one-use admission ID through
`updatedInput`. The admission record binds host session ID, cwd, tool_use_id,
logical tool name, active task and a canonical hash of the arguments, excluding
the admission field. It expires after 60 seconds if not consumed. The gateway
atomically consumes a matching admission before dispatch; existence of an opaque
context alone is insufficient. The gateway does not assume that MCP includes a
trusted host session ID. A caller-supplied admission field is replaced by the
hook, not trusted. Standalone CLI diagnosis can run without an admission but
cannot clear a Codex task; hooked CLI invocations receive the equivalent bound
token in a shell-quoted, structurally reconstructed argv. Subagent edits are
tracked under the parent session plus `tool_use_id`; use host `agent_id` when
present, but correctness must not depend on an identifier absent from an event.

Workspace identity is SHA256 of the canonical worktree root, not the remote URL
or Git common directory. Two worktrees are distinct. A non-Git directory is a
valid workspace. Reject home/root-wide scope by default; setup must not register
all user projects as one workspace. Paths and returned edit targets are
canonicalized and bounded to the selected workspace; external definition
locations may be reported as metadata but cannot authorize an outside edit.

Use owner-only directories/files, atomic temp-file plus rename commits, and an
exclusive per-workspace lock acquired with atomic directory creation. Record
owner PID, process-start identity, and lock token. A stale lock is recoverable
only after proving its owning process is gone; elapsed time alone is insufficient.
Do not hold locks across LSP requests. Capture a generation under lock, analyze,
then compare-and-swap; discard late results for an older generation.

The evidence store is a correctness control, not protection against arbitrary
same-user filesystem tampering. No API accepts asserted diagnostics, arbitrary
receipt contents, or a caller-supplied clean state.

### 4.2 Affected Scope and Admission

Initial scope is the explicit task target set. Before the first edit to an
existing supported file, require a baseline diagnostic request for that file.
While a task is active, `begin_diagnostic_task` is idempotent and unions new
targets into that same task. It never replaces scope, clears pending receipts,
or creates a new task to hide unresolved work. A new task ID is allocated only
after the previous task passes its completion predicate. Scope additions require
baseline diagnosis for newly admitted existing files and invalidate affected
dependency coverage.
New files may be created without a nonexistent baseline but immediately become
dirty. Do not import pre-existing issues elsewhere in the repository into a
small task. All errors/warnings in edited or explicitly admitted files, including
pre-existing issues there, are blocking. Newly introduced findings in dependent
files are also blocking; pre-existing findings outside the admitted targets are
reported separately and do not silently expand correction authority.

Analysis scope and correction scope are distinct. For TypeScript/Svelte, analysis
scope is the nearest containing tsconfig
project plus its affected referenced projects. Analyze the project when native
per-document LSP cannot establish dependent-file completeness; filter reported
scope using provider project membership and reference data, never text grep.
Capture the wider analysis baseline before the first mutation, using provider,
rule, file and stable diagnostic identity to distinguish existing dependent-file
findings from regressions. Do not create suppressions or a repository baseline
file. If the baseline cannot be established, block the initial mutation rather
than guess which dependent findings are new. For Basedpyright, use its project/import analysis; for shell, include the changed
source file and known source dependents; Ruff is file-local. If dependency impact
cannot be established, widen to the containing provider project and report that
scope before analysis. Never label a narrower unknown closure complete.

Configuration or dependency-manifest/lock changes invalidate all affected
provider projects. External edits detected by stat are confirmed by content hash;
before clearing a task or allowing progression, rescan the task inputs and
configuration fingerprints. Do not trust mtime/size alone. Deleted files need a
dependency recheck; deletion by itself is not proof of a diagnostic fix.

Provider selection is global user configuration. An unselected provider is
`not_selected`, not clean. When selected providers cannot cover a changed source
type, report the gap; do not claim universal language coverage. Selecting
Basedpyright and Ruff requires both receipts for Python files.

### 4.3 State Transitions and Valid Evidence

```text
unconfigured -> setup required
ready -> baseline requested -> baseline received
baseline received -> edit admitted -> dirty
dirty -> requested -> running -> issues | failed | clean
issues -> corrective edit -> dirty
clean -> further edit/config change/provider restart -> dirty
```

Each receipt contains `schema_version`, `context_id`, `task_id`, provider ID and
version, executable hash, request ID, affected files, content hashes, input/config
fingerprint, document versions, generation, start/end timestamps, raw-result
digest, findings, coverage, and completeness. Findings preserve original source,
rule, severity, range, encoding, and fix applicability. Normalize public ranges
to zero-based UTF-16 and retain original ranges for auditing; MCPLS positional
arguments keep their documented one-based convention. Test conversions against
the actual pinned MCPLS implementation rather than ambiguous prose.

`clean` requires successful, complete analysis of every required file/provider
for the current generation, with no blocking findings. Empty cached results,
timeouts, truncated output, excluded files, unsupported methods, and analyzer
crashes cannot satisfy this predicate. Deduplicate within a provider using rule,
range and message identity; never discard a provider's finding because another
analyzer reports something similar.

LSP didOpen/didChange are notifications, not acknowledged writes. For pull
diagnostics, the adapter sends the sync notification and diagnostic request in
order on the same connection, binding the request ID to the observed content
hash and document epoch. Accept the response only if that epoch and input hash
are still current; discard it after an intervening edit. An unchanged result ID
may reuse only the matching prior snapshot. A provider lacking reliable ordered
sync/diagnosis behavior requires the CLI fallback. Push
diagnostics require a post-sync publication for the current document version.
If the provider omits a usable version or cannot acknowledge fresh analysis,
use its scoped CLI check before clearing the gate. The adapter observes LSP
responses/publications and supplies provenance unavailable in plain MCPLS text.
Its observations cannot independently mark the gate clean without completed
gateway validation.

### 4.4 Limits and Failure Behavior

Use 500 tracked documents and 10 MiB per file per bridge initially; larger tasks
are partitioned into provider-project batches. Do not silently drop overflow.
After an orderly bridge recycle, all affected receipts are invalidated. Start
only selected applicable providers lazily; do not gate standalone scripts on
the presence of project-marker filenames.

Handshake timeout: 60 seconds; individual LSP attempt: 30 seconds; gateway
operation deadline: 210 seconds, covering MCPLS retries and one respawn. Client
policy must allow a longer tool deadline for long explicit scans, with CLI
fallback through the same evidence writer when the host has a shorter fixed
timeout. Hook decisions have a 5-second internal budget and a 10-second host
timeout; they do not perform long analysis. Cap captured subprocess output at
16 MiB and mark overflow failed, preserving a bounded diagnostic error.

Retry transient transport/readiness failures at most three times per operation
with bounded backoff. Exhaustion produces `failed`, never success. The skill
repairs the tool/configuration issue and retries diagnosis. No retry count clears
a task. User interruption stops the loop and preserves pending state; no
credential workflow or automatic suppression is introduced.

## 5. Public Tools and Agent Workflow

The gateway exposes the 20 MCPLS operation names through one plugin MCP server:

| Group          | Tools                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation     | `get_hover`, `get_definition`, `get_references`, `get_document_symbols`, `workspace_symbol_search`, `go_to_implementation`, `go_to_type_definition` |
| Assistance     | `get_completions`, `get_signature_help`, `get_inlay_hints`                                                                                          |
| Diagnostics    | `get_diagnostics`, `get_cached_diagnostics`                                                                                                         |
| Edit proposals | `get_code_actions`, `rename_symbol`, `format_document`                                                                                              |
| Calls          | `prepare_call_hierarchy`, `get_incoming_calls`, `get_outgoing_calls`                                                                                |
| Observability  | `get_server_logs`, `get_server_messages`                                                                                                            |

Add exactly four orchestration tools:

| Tool                    | Inputs                                                          | Output/authority                                                                 |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `begin_diagnostic_task` | context ID, relative/absolute target files                      | Validated task ID, provider coverage, next required calls; does not assert clean |
| `diagnose`              | context/task ID, files, optional providers, mode `auto/lsp/cli` | Aggregated current receipts and outstanding findings                             |
| `diagnostic_status`     | context/task ID                                                 | Missing/stale receipts, pending mutations, gate state and next corrective action |
| `runtime_status`        | optional selected providers                                     | Installed/selected/healthy capabilities, versions and setup failures             |

`get_diagnostics` requests real analysis and returns provenance plus provider
results; Python aggregates selected Basedpyright/Ruff routes. Cached diagnostics
are explicitly advisory. Other tools preserve MCPLS fields, adding an optional
provider selector. Reject unknown provider IDs and arbitrary executable options.
Call-hierarchy items include an opaque origin handle so subsequent calls cannot
reach a different provider after restart. Workspace symbols fan out across
supported routes with partial-provider failures visible.

Do not duplicate all 20 tools for each provider in Codex. Internal MCPLS contexts
may be separated by provider/language group to preserve correct JS/TS routing
and independent Python diagnostics. Apply capabilities from actual initialize
responses, including dynamic updates observed by the adapter. Unsupported tools
remain explicit capability errors, not fabricated empty results.

The correction skill's exact sequence is:

1. Read hook context; call `runtime_status` and `begin_diagnostic_task`.
2. Request baseline `diagnose` for existing targets; receive and inspect results.
3. Use navigation and `get_code_actions` to understand actionable findings.
4. Apply scoped edits through the host's normal editing tool. Never mark an edit
   plan as applied merely because a server returned it.
5. Call `diagnose` again for the dirty generation and affected dependencies.
6. Repeat while issues remain; use logs/settings/reference commands to repair
   analyzer failures. Check `diagnostic_status` before task progression.
7. Let the hook independently confirm clean evidence before completion.

Document actual discovered Codex tool names in the installed-session receipt;
do not hard-code a presumed `mcp__...` prefix as portable truth. Store examples
using logical `tools/call` names and show their host mapping after setup.

### 5.1 Exact Planned Call Sequence

These are the plugin's proposed public contract, not claims that its tools exist
in the current session. `ctx-example` denotes a real context returned by the
installed SessionStart hook; `task-example` is replaced with the ID returned by
begin. The agent does not invent these identifiers. The trusted PreToolUse hook
injects the one-use `admission_id` before dispatch; its absence in the examples
is intentional. JSON-RPC request IDs are chosen by the MCP client independently.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "begin_diagnostic_task",
    "arguments": {
      "context_id": "ctx-example",
      "files": ["src/example.py"]
    }
  }
}
```

Baseline and post-correction diagnosis use the same operation; the gateway binds
each execution to the current generation instead of trusting a generation
number supplied by the model. Omitted `providers` means all selected providers
applicable to the requested files. For Python, both selected analyzers are
required even if the agent requests only one during an intermediate investigation.

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "diagnose",
    "arguments": {
      "context_id": "ctx-example",
      "task_id": "task-example",
      "files": ["src/example.py"],
      "mode": "auto"
    }
  }
}
```

For a diagnostic's range, convert the normalized receipt coordinates back to
the tool's one-based position convention, then request an edit proposal:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_code_actions",
    "arguments": {
      "context_id": "ctx-example",
      "provider": "ruff",
      "file_path": "/absolute/workspace/src/example.py",
      "start_line": 1,
      "start_character": 1,
      "end_line": 1,
      "end_character": 10,
      "kind_filter": "quickfix"
    }
  }
}
```

Inspect the returned applicability and edits, correct through the host edit
tool, and repeat `diagnose`. Before progression, call `diagnostic_status` with
`context_id` and `task_id`. The hook independently evaluates the same predicate;
an agent saying it inspected the result cannot replace that check. Cache-only
`get_cached_diagnostics` never substitutes for the fresh `diagnose` step.

The gateway returns a bounded human-readable summary and structured content
with this stable top-level shape. Provider receipts use section 4's full schema:

```json
{
  "schema_version": 1,
  "context_id": "ctx-example",
  "task_id": "task-example",
  "status": "issues",
  "generation": 2,
  "complete": true,
  "receipts": [],
  "missing_providers": [],
  "next_action": "correct_and_rediagnose"
}
```

The empty receipts array above is a shape illustration only; it cannot satisfy
the clean predicate for a task requiring analysis. `complete` means all required
analysis completed, not that it found no issues. Status `clean` additionally
requires zero blocking findings and current validated receipts. Tests reject
combinations such as clean with missing providers or stale input hashes.

### 5.2 Exact Planned Setup and Maintenance CLI

The setup skill first inventories the machine and asks which provider IDs to
install. It then uses the package-contained entrypoints below. Paths denote the
installed package and resolved managed Node executable, not a subject project.
These subcommands and arguments are implementation requirements:

```sh
bash <installed-package>/runtime/bootstrap.sh inventory
bash <installed-package>/runtime/bootstrap.sh install
<managed-node> <installed-package>/runtime/cli.mjs inventory --json
<managed-node> <installed-package>/runtime/cli.mjs setup --providers typescript,basedpyright,svelte,shell,ruff --dry-run --json
<managed-node> <installed-package>/runtime/cli.mjs setup --providers typescript,basedpyright,svelte,shell,ruff --json
<managed-node> <installed-package>/runtime/cli.mjs doctor --json
<managed-node> <installed-package>/runtime/cli.mjs export --output <restore-manifest>
<managed-node> <installed-package>/runtime/cli.mjs restore --manifest <restore-manifest> --dry-run --json
<managed-node> <installed-package>/runtime/cli.mjs restore --manifest <restore-manifest> --json
<managed-node> <installed-package>/runtime/cli.mjs upgrade --providers ruff --dry-run --json
<managed-node> <installed-package>/runtime/cli.mjs upgrade --providers ruff --json
<managed-node> <installed-package>/runtime/cli.mjs rollback --providers ruff --json
<managed-node> <installed-package>/runtime/cli.mjs uninstall --providers ruff --dry-run --json
<managed-node> <installed-package>/runtime/cli.mjs uninstall --providers ruff --json
```

Use only the user's actual selected subset, not all five by default. `--dry-run`
must make no installation or configuration changes. Upgrade installs only the
target pinned by the currently installed plugin's reviewed toolchain lock; it
does not query and execute arbitrary latest releases. Rollback selects the last
verified retained receipt. Unknown options/provider IDs fail before mutation.
Standalone CLI `diagnose --files <paths...> --mode auto --json` is supported;
hooked invocation additionally receives context, task and admission arguments
and goes through the same evidence writer as MCP. Standalone diagnosis cannot
clear an unrelated Codex task.

Rationale: executable reference examples are necessary for skills to request,
receive and resolve diagnostics consistently. Sources: S1, S12, S14 for host and
MCP conventions; these plugin-specific APIs are design decisions validated in
T04 and T09 rather than copied upstream APIs.

## 6. Provider Implementation Contracts

### 6.1 TypeScript Native

Launch the locked native engine with `tsc --lsp --stdio`; do not use the preview
package or `typescript-language-server` for this provider. Handle TypeScript and
JavaScript language IDs explicitly. Supply configuration disabling automatic
type acquisition; prove it with an npm invocation spy. The adapter removes null
parameters from shutdown for the pinned native server and preserves all other
requests.

Reference CLI: `<managed-tsc> --project <tsconfig> --noEmit --pretty false --locale en`.
No `--outputjson` flag is assumed. Keep stdout/stderr separate, parse the pinned
compiler's diagnostics with tested framing, preserve raw output, and reject
unrecognized failure output. `--diagnostics`/`--extendedDiagnostics` are only
performance instrumentation. Redirect incremental metadata to plugin state and
prove that no subject build information or emitted files change.

Native document diagnostics do not imply `workspace/diagnostic` support. Use
the CLI companion for required project coverage. Unsupported subject options
are reported, not deleted from tsconfig. Rationale and sources: S5.

### 6.2 Basedpyright

Launch `basedpyright-langserver --stdio`. The adapter supplies
`basedpyright.analysis.diagnosticMode = openFilesOnly` for interactive work and
`basedpyright.analysis.baselineMode = discard`. Respect project type-checking
settings; otherwise retain the engine's recommended defaults. For a selected
strict audit profile, supply explicit settings with their own fingerprint.
Use `python.pythonPath` only for the subject interpreter selected from project
metadata; do not confuse it with the analyzer's installation Python.

Reference CLI: `<managed-basedpyright> --baselinemode discard --outputjson --project <root-or-config> <file>`.
Use `--pythonpath <interpreter>` when explicitly resolved. Parse JSON structurally
and preserve error/warning counts and exit status. Verify the pinned command's
baseline behavior because successful diagnosis must not rewrite the project's
existing baseline. Test additional rules including `reportAny`,
`reportUnreachable`, and invalid casts with fixtures that enable them.
Rationale and sources: S6 and the historical rules links in section 2.

### 6.3 Ruff

Launch `ruff server`, never `ruff-lsp`. Migration detects unsupported legacy
`lint.run`, `lint.args`, `format.args`, `ignoreStandardLibrary`, and
`showNotifications`; translate recognized settings into native initialization
settings, report unsupported ones, and never copy VS Code-only `path` or
`interpreter` as LSP settings. Use `configurationPreference = filesystemFirst`;
selected agent policy overrides are recorded and delivered consistently to CLI
and LSP. No global Python target is inferred from the analyzer runtime.

Reference diagnosis: `<managed-ruff> check --no-fix --no-fix-only --output-format json --cache-dir <owned-cache> -- <files>`.
Sanitize inherited output/cache environment variables so output cannot silently
redirect. Use `ruff format --check -- <files>` for a separate formatting result.
For a patch proposal use `ruff check --diff --no-unsafe-fixes -- <file>` or
`ruff format --diff -- <file>`. A diff is not a complete lint result. The agent
applies reviewed edits and rechecks; hooks do not invoke blind autofix. Never use
`--exit-zero`, `--add-noqa`, `--add-ignore`, or unsafe fixes to clear this gate.

Coverage is explicit: the task enumerates `.py`, `.pyi`, and `.pyw`; use the
verified native extension setting and CLI `--extension pyw:python` to map `.pyw`
without enabling preview. Do not recursively include notebooks.
Use `--show-files` and `--show-settings` with matching arguments to record
coverage/configuration. An explicitly edited excluded file remains in the
required task scope: report the exclusion and keep its receipt incomplete until
an explicit file diagnosis under the selected policy succeeds. Do not silently
override `force-exclude` or label an excluded file clean. Routine scans respect
discovery exclusions and report skipped paths separately.

Preserve closest-config semantics and explicit `extend`; parent files are not
automatically merged. In one directory `.ruff.toml` precedes `ruff.toml`, then
`pyproject.toml`. Dedicated flags override equivalent inline `--config` values;
inline values override discovered files. Avoid passing a replacement config file
in ordinary mode because that changes relative paths and Python target inference.
Fingerprint selected config, extended files, ignore inputs, and explicit flags.
Rationale and sources: S7, S8.

### 6.4 Svelte

Launch the managed `svelteserver --stdio`. Keep its supported JS TypeScript graph
isolated from native TS7. Advertise `textDocument.diagnostic`; supply
`initializationOptions.configuration.svelte.plugin` with TypeScript, Svelte and
CSS diagnostics enabled. Verify pull registration and result IDs instead of
assuming the provider is push-only.

Project compiler/preprocessor loading requires trusted subject configuration;
the skill records the trust decision for the task. Untrusted mode does not load
project executable configuration. Its bundled fallback may not cover Svelte 5
semantics, so reduced mode cannot clear a full Svelte 5 task. This distinction is
not an instruction to install the LSP in the subject project.

CLI companion: `<managed-svelte-check> --workspace <root> --tsconfig <config> --output machine-verbose --no-color`;
use `--no-tsconfig` only for an explicitly file-oriented Svelte scan. Parse
timestamped JSON rows and START/COMPLETED/FAILURE envelopes; do not treat the
whole stream as NDJSON. Require completion, correct range conversion, and
visible failures. Do not enable `--tsgo-experimental-api` in v1; native Svelte
scan modes that emit intermediate files are outside the default hot path.
Rationale and sources: S9.

### 6.5 Bash and POSIX Shell

Launch `bash-language-server start`. Supply the `bashIde` configuration section
with managed `shellcheckPath`, array-valued `shellcheckArguments`, managed
`shfmt.path`, `shfmt.languageDialect = auto`, and an empty explainshell endpoint.
Preserve repository-first ShellCheck configuration and user fallback. No
deprecated environment-setting path is used when a native setting exists.

Reference CLI: `<managed-shellcheck> --format=json1 <file>`; use
`--rcfile=<resolved-policy>` when resolving nested configuration explicitly.
For declared POSIX files use `--shell=sh`; never globally force Bash. No-shebang
`.sh` files use the provider's Bash default with that assumption visible.
Formatting proposals use `<managed-shfmt> -d <file>` or `-d -ln=posix`.
shfmt is not a diagnostic replacement; never run the subject shell script.

Require a ShellCheck canary because ENOENT can disable linting while the LSP
continues returning empty results. ShellCheck source following may read outside
the MCP input root; do not advertise MCP path validation as a child-process
filesystem sandbox. Rationale and sources: S10, S11.

## 7. Hook Enforcement Contract

### 7.1 Allowed and Blocked Operations

| State                       | Allowed                                                                                           | Blocked                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Setup incomplete            | Setup skill, inventory, owned installer/doctor operations, relevant reads                         | Claiming diagnostic enforcement or completing a covered code task |
| Baseline missing            | Begin task, diagnose, relevant reads/navigation                                                   | Editing existing covered targets without the required baseline    |
| Dirty/running/issues/failed | Diagnosis/status/logs, relevant reads/navigation, corrections inside active scope, runtime repair | Unrelated new work, task completion, commit/push/publish commands |
| Clean                       | Normal authorized next task/actions                                                               | Operations prohibited by ordinary host/user policy                |

`PreToolUse` parses the complete supported apply_patch grammar, validates all
targets before allowing it, and records a pending mutation keyed by
`tool_use_id`. New targets must be admitted to the task first. Corrective edits
within scope remain possible while dirty. Hook admission is serial under the
workspace lock; a second mutation cannot race a still-pending operation into a
false clean generation.

While dirty, shell access is limited to structurally parsed, allowlisted
read-only argv and the plugin's typed diagnostic/repair CLI. Pipelines, command
substitution, redirection, interactive shells, and unknown commands do not gain
access through a name regex. The host's ordinary read tools remain available.
When clean, shell commands still receive structural admission checks. Deny
compound commands mixing source mutation and commit/push/publication. Mark an
unknown or potentially mutating command pending before execution, not merely
after it returns. Propagation is a separate invocation admitted only after
mutation reconciliation and fresh diagnostics. Do not claim static shell
classification can constrain arbitrary opaque executables: custom executables
capable of propagation are outside the verified gate and require an explicitly
qualified command adapter. Normal authorized non-propagating operations remain
possible; completion reconciles files and invalidates changed inputs.
An ongoing unified-exec operation prevents clean completion until its final
PostToolUse event. `write_stdin` is not assumed to receive a new PreToolUse check.
Do not admit backgrounding syntax, nohup/disown, or an interactive shell as a
qualified mutation path. Plugin-owned command adapters wait for owned child
processes; a yielded host execution remains pending until final reconciliation.
A missing terminal event leaves the task pending. Unobservable daemonized
children are outside the qualified command set, not silently treated as finished.

`PostToolUse` reconciles success, partial changes, and failure; it records dirty
generation and provides the exact next diagnostic call. It cannot undo a side
effect. Concurrent formatter hooks are handled by pre/post-analysis hashes and
the next progression check, never assumed hook ordering.

`Stop`/`SubagentStop` independently inspect pending mutations and current
receipts. They return continuation when unclean. Do not turn
`stop_hook_active = true` into an unconditional bypass. An interrupted session
retains dirty state and must revalidate on resume. No automatic waiver or
model-callable scope-shrinking operation is provided.

### 7.2 Exact Blocking Output

PreToolUse rejection:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Pending diagnostics for the active task. Run diagnose for the listed files, resolve findings, and revalidate."
  }
}
```

Stop/SubagentStop continuation:

```json
{
  "decision": "block",
  "reason": "The current source generation has missing or unresolved diagnostics. Continue the diagnose-and-fix workflow; do not report completion."
}
```

Use synchronous command hooks. Catch internal exceptions and output a valid
blocking decision or exit 2 with a bounded reason. Never rely on a hook timeout,
malformed JSON, missing MCP-tool hook, or `permissionDecision = ask` to fail
closed: the documented host behavior does not guarantee that. Source: S2.

### 7.3 Honest Enforcement Boundary

Installed plugins do not automatically have trusted hooks. Setup must show the
required review/trust action, run live canaries, and record `enforcement = active`
only after observing blocks. Changed hook hashes require renewed trust.
Disabled/untrusted hooks, unsupported tool paths, hosted tools outside hook
coverage, same-user tampering, and other hooks returning a stronger stop decision
are host limitations, not conditions this plugin can invisibly defeat.

Do not promise absolute prevention of every possible action. The supported
contract is enforced progression through tested local tool paths and completion
events with hooks enabled and trusted. A gap is visible as unhealthy enforcement
and blocks release qualification for that host profile. User interruption remains
possible. Sources: S1, S2.

## 8. Modular Implementation Tasks

Each task must retain red/green evidence for behavior changes, independently
review the consuming side, and record commands/results. Sources define upstream
facts; rationale and interface choices are this plan's engineering decisions.
Run tests using real providers where specified, not only mocks.

### T00 - Host and Package Compatibility Contract

Depends on: none. Owner: plugin integration.

- [ ] Add a contained `cwd` field to repository MCP schema/validator handling and
      tests; preserve rejection of unknown fields and escaping paths.
- [ ] Document the narrow package-code versus owned-runtime-state distinction;
      update relevant contributor/package policy consistently.
- [ ] Build an isolated test plugin proving package-relative launcher resolution,
      hook root resolution, context delivery and trusted blocking on the pinned
      CLI and macOS desktop host. Never register a duplicate global MCP to hide
      a bundled-connection failure.
- [ ] Prove that PreToolUse `updatedInput` reaches both the MCP gateway and typed
      CLI invocation: the injected admission is consumed once and binds actual
      arguments. Missing, replayed, wrong-session or altered-argument admissions
      must fail before provider dispatch. A host without working input rewriting
      fails qualification before later phases can rely on this identity contract.
- [ ] Reject release qualification when these host tests fail; correct the
      package/host integration before continuing, without weakening the gate.

Verification: valid cwd succeeds; absolute/parent escaping cwd and outside
symlinks fail. A real blocked tool does not execute its sentinel side effect.
Rationale: source/manifest validity alone cannot prove host consumption.
Sources: S1, S2, S13, S15.

### T01 - Scaffold and Versioned Provider Catalog

Depends on: T00. Owner: package authoring.

- [ ] Create the complete section 3.1 package using repository templates, MIT
      package licensing, upstream notices, initial version and four skills.
- [ ] Define and validate provider descriptors and user settings; reject unknown
      providers, arbitrary commands and out-of-package adapter paths.
- [ ] Create complete toolchain locks with official URLs, versions, platform
      digests, dependency graphs and license metadata for all selected targets.
- [ ] Bundle the runtime JavaScript dependencies; prove execution from a copy of
      this package with repository maintenance dependencies unavailable.

Verification: manifest/skill schemas, deterministic bundle regeneration,
missing-resource and incomplete-lock negative tests. Rationale: recovery and
community distribution cannot depend on the author's checkout. Sources: S12, S13.

### T02 - Installation, Platform Adapters and Recovery

Depends on: T01. Owner: provisioning.

- [ ] Implement read-only inventory and structured installation plans; ask for
      provider selection and show exact dependency closure and destinations.
- [ ] Implement the Node-free bootstrap and generated shell-safe lock from
      section 3.2; test a clean machine with no Node, uv, Python or receipt.
- [ ] Provision exact private installations with NVM/uv/native platform adapters;
      do not replace global tsc, Ruff, Python or another plugin's installation.
- [ ] Implement staging, integrity checks, atomic activation, idempotence, previous
      version retention and scoped cleanup. Refuse unverified or incompatible
      existing executables; never silently borrow transitive SDKs.
- [ ] Implement portable restore-manifest export/import: provider selections,
      policy and exact versions, without absolute home paths, task source or secrets.
- [ ] Restore resolves current platform paths and redownloads locked assets;
      offline recovery works only when verified artifacts were also retained.
- [ ] Uninstall removes only owned files after checking active process receipts;
      borrowed validated runtimes and host configuration are preserved.

Verification: fresh macOS ARM64/x64, Linux glibc ARM64/x64, changed username,
partial selections, repeated setup, corrupted archive, interrupted install,
offline cached use, rollback and live-process cleanup rejection. Rationale:
installation is a reproducible transaction. Sources: S1, S3, S7, S11.

### T03 - Context and Evidence Store

Depends on: T01. Owner: runtime state.

- [ ] Implement section 4 schemas, context registration, canonical workspace IDs,
      task admission, generation transitions and provider receipts.
- [ ] Implement atomic updates and per-workspace locks; refuse stale-lock removal
      without process-identity evidence.
- [ ] Implement task-scope and configuration fingerprint invalidation, external
      content rechecks and cross-worktree separation.
- [ ] Make receipt validation a pure shared module used by gateway and hooks;
      never maintain separate definitions of clean in each consumer.

Verification: wrong-session context, reused generation, delayed results,
same-size/same-mtime edits, concurrent hooks, worktrees, subagents, partial writes,
deleted targets, admission replay/expiry/argument substitution, scope-union
preservation and invalid receipt schemas. Rationale: this closes the
request/receive/correct/revalidate loop mechanically. Sources: S2, S14.

### T04 - MCP Gateway and LSP Adapter

Depends on: T02, T03. Owner: protocol integration.

- [ ] Implement the 24 public tools with schemas and bounded outputs; preserve
      partial provider errors and source provenance.
- [ ] Use SDK v2 with explicit legacy negotiation toward pinned MCPLS; lazily
      spawn isolated provider/language contexts with correct explicit roots.
- [ ] Implement only the settings, diagnostic observation, capability and shutdown
      compatibility behavior specified in section 3 using vscode-jsonrpc framing.
- [ ] Forward cancellation, progress, server requests and errors; reject
      workspace/applyEdit so servers cannot apply edits behind the agent.
- [ ] Implement timeouts, orderly shutdown and owned-process cleanup; capture
      raw protocol fixtures with no private source or credentials.

Verification: split/coalesced frames, malformed messages, Unicode, setting
responses, dynamic capabilities, cancellation, native shutdown, restart,
concurrent roots and unsupported capabilities. Mutation tests remove each
compatibility transform and must fail for the expected reason. Sources: S3-S5,
S9, S12, S14. Rationale: reuse protocol libraries and make adaptations explicit.

### T05 - Native TypeScript Adapter

Depends on: T04. Owner: TypeScript provider.

- [ ] Implement native LSP launch, language mappings, configuration delivery and
      managed-engine selection independent of subject TypeScript.
- [ ] Implement structured LSP results and the explicit project CLI companion;
      isolate incremental writes and reject unknown CLI failure output.
- [ ] Add fixtures for configured/inferred projects, references and each supported
      TS/JS extension; verify automatic type acquisition is inactive.

Verification: intentional TS2322 appears, correction clears it, affected
dependent-file regression is detected, JS checking provenance is visible,
unsupported config fails clearly, no npm invocation and no subject emission.
Rationale: exploit native TS7 without a repository migration. Source: S5.

### T06 - Independent Python Providers

Depends on: T04. Owner: Python providers.

- [ ] Implement both LSP adapters and CLI parsers, retaining separate Basedpyright
      and Ruff diagnostic ownership and correction proposals.
- [ ] Implement actual Basedpyright settings delivery and baseline discard;
      verify subject interpreter resolution separately from analyzer runtime.
- [ ] Implement Ruff migration, precedence, per-file coverage and formatting
      contracts from section 6.3, including `.pyw` without preview.
- [ ] Test CLI JSON fixes as proposals and block unsafe/suppression-based shortcuts.

Verification: assignment/rule fixtures, Basedpyright extra rules, `.venv`, missing
imports, Ruff F401/F821, baseline unchanged, `fix=true` cannot mutate during
diagnose, lint-vs-format exclusions, closest configs, explicit force-exclude,
stdin filenames, file paths with spaces and LSP/CLI policy agreement.
Rationale: types, lint and formatting provide complementary evidence. Sources:
S6-S8. Excluded required files must fail completeness, not pass with no findings.

### T07 - Svelte and Shell Providers

Depends on: T04. Owner: framework/shell providers.

- [ ] Implement Svelte pull capability negotiation, configuration/trust behavior,
      compiler provenance and stable svelte-check framing.
- [ ] Implement Bash settings delivery, ShellCheck canary/dialect/config selection
      and shfmt proposal support.
- [ ] Preserve partial/reduced analysis as incomplete and document provider
      filesystem/configuration side effects accurately.

Verification: Svelte type/compiler/style errors and clean transitions, Svelte
4/5/preprocessor fixtures, untrusted reduced mode, malformed/missing CLI
completion; shell parser/ShellCheck findings, POSIX/Bash distinction, missing
linter false-green negative, source dependencies, heredocs and no script execution.
Rationale: provider-specific capability gaps need provider-specific tests.
Sources: S9-S11.

### T08 - Enforced Diagnostic Workflow

Depends on: T03-T07. Owner: hooks and agent workflow.

- [ ] Implement SessionStart, PreToolUse, PostToolUse, Stop and SubagentStop
      behavior exactly as section 7; ordinary non-code work is unaffected.
- [ ] Parse full edit payloads and classify shell access structurally. Record
      pending mutation before admitting a write, reconcile actual outcome after.
- [ ] Generate bounded next-action instructions with task ID, provider, files and
      exact diagnostic call. Keep repairs possible while blocking new work.
- [ ] Run end-to-end adversarial sessions that attempt to skip request, receipt,
      correction, or revalidation; include code-mode and subagent paths.
- [ ] Test formatter-hook races, missing runtime, malformed hook output and
      disabled/untrusted hooks; display unhealthy enforcement instead of success.

Verification: blocked sentinel tools never execute; attempted final responses
continue until clean; stale cached results do not release the gate; corrected
code does release it; combined edit-and-push commands are rejected before any
side effect; explicit user interruption preserves pending state.
Rationale: the user's central requirement is behavioral enforcement. Source: S2.

### T09 - Skills, Exact References and Extension Contract

Depends on: T02, T04-T08. Owner: skill authoring.

- [ ] Complete the four skills with scoped descriptions, one agent manifest each,
      exact commands, logical MCP examples and installation considerations.
- [ ] Generate tool-reference examples from the public schemas and replay them
      against actual fixture providers; verify discovered host name mapping.
- [ ] Document installation choices, errors, correction order, recovery,
      configuration provenance, limits, side effects and unsupported states.
- [ ] Document a new-provider recipe requiring descriptor, installer, settings,
      diagnostic normalizer, capability canary, freshness proof and tests.

Verification: schema/resource integrity, matching/nonmatching skill triggers,
provider-selection dialog, actual tool invocation, correction without unnecessary
full-repository scripts, and a fixture provider integrated without editing the
central gate predicate. Rationale: skills teach reliable use, not merely advertise
tools. Sources: S1, S13, S14.

### T10 - Qualification, Documentation and Marketplace Delivery

Depends on: T00-T09. Owner: release qualification.

- [ ] Add package tests to the repository's actual discovery and CI paths. Assert
      expected provider suites/test counts so `--passWithNoTests` cannot mask
      missing new tests; retain a separately invocable package-only test command.
- [ ] Run focused protocol/provider/hook/installation tests and real installed
      Codex tests, then repository checks and documentation consistency checks.
- [ ] Validate manifest, README, CHANGELOG, skills, hooks and generated marketplace
      as one product; use `marketplace:build`, never hand-edit the catalog.
- [ ] Record latency/memory/process measurements, correctness, skipped platforms
      and exact source/toolchain revisions in the qualification receipt.
- [ ] Follow authorized PR completion for product delivery; do not commit, push
      or publish merely because this document was created.

Commands for implementation qualification:

```sh
npm run check
npm run marketplace:build
npm run marketplace:check
npm run documentation:gate -- --base <base> --head <head>
codex plugin marketplace add nerymurillohnd/codex-essentials --ref main
codex plugin add code-intelligence@codex-essentials
```

The final two commands are installed-package acceptance steps after the plugin
exists in the selected marketplace, not commands to run against today's catalog.
After installation, run the setup skill, select providers, review/trust hooks,
start a fresh session and exercise real MCP diagnostics and enforced correction.
Repeat from an empty user runtime directory to qualify recovery.

Verification: all selected providers diagnose and clear known defects through
the installed plugin; trusted hooks block the negative workflow canaries; a
fresh-machine restore reproduces the locked toolchain. Deliberately missing
provider suites, stale catalog entries, corrupt artifacts and untrusted hooks
must fail qualification rather than produce a successful installation claim.

Rationale: the installed/recovered product is the deliverable, not a green source
checkout. Sources: S1, S2, S13 and the repository's current package scripts.

## 9. Acceptance Matrix and Release Blockers

| Contract      | Positive evidence                                       | Required negative evidence                                             |
| ------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Package       | Installed bundle executes without checkout dependencies | Escaping resources and unsupported fields rejected                     |
| Setup         | Selected provider closure installed and restored        | Corrupt/missing assets never silently substituted                      |
| Identity      | Correct context accepted in each worktree               | Other-session/root context rejected                                    |
| Diagnosis     | Every selected provider finds a known issue             | Missing executable or excluded file cannot return clean                |
| Freshness     | Corrected current generation clears findings            | Old result ID/hash/version cannot release gate                         |
| Correction    | Agent applies contextual edit and rechecks              | Proposed edit alone cannot count as applied                            |
| Hook behavior | Clean work can progress                                 | Skip-request, skip-receive, skip-fix and skip-recheck attempts blocked |
| Concurrency   | Concurrent diagnostics settle on current generation     | Late results and pending writes cannot clear state                     |
| Lifecycle     | Clean shutdown and restart recovery                     | Orphans and forced-kill-only shutdown fail qualification               |
| Configuration | Effective policy and subject target reported            | Ignored settings or policy drift fail parity tests                     |
| Recovery      | New user path restores selected engines                 | No author-specific paths or ambient compiler dependencies              |
| Platform      | Real platform canaries pass                             | Untested platform cannot be advertised as qualified                    |

Publication requires all applicable rows, documentation, and platform claims to
match observed results. A protocol gap found during implementation is a blocked
qualification item requiring a fix and regression test, not an invitation to
silently replace this architecture or weaken a check.

Warm changed-file diagnosis target: p95 under 2 seconds on the checked-in small
fixtures; gate decision target: p95 under 100 ms excluding cold process startup.
Measure cold startup, project scans, memory and process counts independently.
Record hardware and fixture revision. Correctness and complete diagnostics take
precedence; a missed performance target requires documented optimization, not
skipping providers or serving stale results.

## 10. Document Delivery Versus Implementation Completion

### 10.1 Requested-Deliverable Audit

The requested deliverable is the researched architecture and execution plan,
not execution of its implementation tasks. This mapping is the document-level
completion audit; release qualification remains section 9's separate obligation.

| Explicit requirement                                         | Document evidence                                                                                        | Delivery assessment |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------- |
| TypeScript, Basedpyright, Svelte, Bash/sh and Ruff LSPs      | Sections 1, 3.3 and 6 define exactly those provider IDs, engines, dependencies and commands              | Covered             |
| Independent agent tooling usable across projects             | Sections 1.1, 3.1, 3.2 and 4 separate installation, subject inputs, workspace and session identity       | Covered             |
| Complete modular architecture                                | Section 3 explains each layer, alternatives, package structure, bootstrap and ownership                  | Covered             |
| Detailed tasks with verification, sources and rationale      | T00-T10 each contain unchecked tasks, dependencies, owner, verification and source/rationale statements  | Covered             |
| Plugin tools, skills, files, configuration and documentation | Sections 3.1 and 5 plus T01/T09 define the packaged components and interfaces                            | Covered             |
| Remote marketplace distribution and community reuse          | T10 specifies repository gates, catalog generation, installation and platform qualification              | Covered             |
| Reinstallation after machine reset or data loss              | Sections 3.2, 3.3 and 5.2 plus T02 define bootstrap, locks, export/restore and rollback                  | Covered             |
| Immediate diagnostic correction and enforced revalidation    | Sections 4, 5 and 7 plus T08 define the complete correction loop and host limits                         | Covered             |
| Exact command and tool-call references for skills            | Sections 5.1, 5.2 and 6 include MCP JSON examples, CLI contracts and provider commands; T09 replays them | Covered             |
| Incorporation of supplied Ruff sources                       | Sections 2 and 6.3 cover migration, discovery, precedence, lint and format behavior with source links    | Covered             |
| Delivery under docs/contributing                             | This document is stored at the owner's requested contributor-documentation destination                   | Covered             |

Document verification on 2026-09-06: focused Prettier and Markdownlint checks
passed; 11 task modules, 49 unchecked implementation tasks, seven JSON examples,
three MCP call examples and both local document links passed structural checks.
A deliberately incomplete task was rejected by the document-contract checker.
An independent adversarial review found identity, shell progression, initial
bootstrap, scope expansion, freshness and remediation-boundary gaps; the
corresponding contracts and negative tests were corrected before delivery.
No plugin runtime, provider qualification suite or marketplace publication is
represented by these document-only checks.

### 10.2 Implementation Boundary

This plan defines the implementation decisions and release acceptance contracts.
It does not claim that the gateway, adapter, hooks, installer, platform matrix or
plugin have been implemented. The source register separates observed upstream
behavior from proposed plugin behavior, and every implementation task remains
unchecked until its own evidence exists.

Creating this document does not alter the existing personal MCPLS configuration,
install providers, register an MCP server, modify the generated marketplace,
commit, push or publish anything. A later migration from personal MCPLS to this
plugin must verify the bundled connection first and remove duplicates only within
the user's authorized migration scope.
