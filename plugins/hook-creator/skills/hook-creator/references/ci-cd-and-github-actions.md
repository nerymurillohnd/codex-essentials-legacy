# CI/CD and GitHub Actions

> Official sources: [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode),
> [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action), and
> [Hooks](https://learn.chatgpt.com/docs/hooks).
> Last verified: 2026-09-07.
> Recheck action inputs, supported runners, CLI flags, authentication, and hook-trust behavior.

Read this reference when hooks must operate under `codex exec`, a pipeline, or
`openai/codex-action`.

## Separate three mechanisms

- A **Codex lifecycle hook** reacts inside a Codex session.
- A **GitHub Actions step** is workflow orchestration around processes.
- A **Git hook** reacts to local Git operations.

They may call one another, but their configuration, authority, inputs, and failure semantics are not
interchangeable.

## Codex Exec

`codex exec` is the non-interactive Codex entrypoint. Automation must establish:

- exact Codex version;
- `CODEX_HOME` and selected profile;
- checkout/root `cwd`;
- user/project/plugin/managed hook sources present on the runner;
- whether project configuration is trusted;
- hook trust for the exact definitions;
- sandbox and approval mode;
- required MCP connectivity;
- credentials visible to Codex and child handlers;
- artifacts retained after the ephemeral runner ends.

`codex exec --help` currently exposes `--dangerously-bypass-hook-trust` for automation that already
vets hook sources. The flag is dangerous: it skips persisted hook trust for that invocation. Use it
only when the user explicitly owns an external review/signing control and the runner isolates the
job. It does not bypass sandbox or approval controls by itself.

Do not claim CI enforcement merely because a hooks file exists in the checkout. Prove Codex loaded
the intended config, the event occurred, the matcher matched, and the handler result affected the
job as designed.

## Codex GitHub Action

`openai/codex-action@v1` installs Codex, optionally starts a Responses API proxy for the key, and runs
`codex exec` with selected permissions. Relevant inputs include:

- one of `prompt` or `prompt-file`;
- `codex-args` for CLI flags/profile/config;
- `model` and `effort`;
- `sandbox`;
- `output-file`;
- `codex-version` to pin a release;
- `codex-home` to select reusable configuration/MCP state;
- `safety-strategy`, `unprivileged-user`, `allow-users`, and `allow-bots`.

The action does not automatically invent, trust, or verify lifecycle hooks. If hooks are part of the
job, explicitly provide the config and handlers in the chosen Codex home/project/plugin source and
define how trust is established.

Inactive wiring pattern:

```yaml
- uses: actions/checkout@v5
  with:
    persist-credentials: false

- name: Run Codex with reviewed project configuration
  uses: openai/codex-action@v1
  with:
    openai-api-key: ${OPENAI_API_KEY}
    prompt-file: .github/codex/prompts/review.md
    codex-version: "0.153.4"
    sandbox: read-only
    codex-args: '["--ephemeral"]'
```

`${OPENAI_API_KEY}` denotes the workflow's secret-store binding; never materialize its resolved value
in the file or logs. This snippet does not establish hook trust and therefore is not a complete hook
integration. Add a trust strategy only after selecting one of:

- persistent, pre-reviewed Codex home on a controlled runner;
- plugin/user hook state prepared and audited outside the job;
- externally vetted one-off bypass with explicit risk acceptance;
- no lifecycle hooks, with the pipeline invoking a standalone check directly instead.

## Credentials and permissions

- Prefer the official action over installing/authenticating Codex manually in GitHub Actions.
- Do not expose `${OPENAI_API_KEY}` or `${CODEX_API_KEY}` as a job-level environment variable to
  repository-controlled build scripts, tests, dependency hooks, or later steps.
- Use the narrowest repository permissions, sandbox, network, and trigger allowlist.
- On Linux/macOS, retain the default `drop-sudo` safety strategy or use an unprivileged user. The
  documented Windows path requires `safety-strategy: unsafe`; disclose that risk.
- Sanitize pull request, commit, issue, and hidden HTML input before placing it in prompts or hook
  context.
- Run Codex as the last secret-bearing step so later commands cannot inherit unexpected state.

## Pipeline design

For a mutating automation, prefer separation:

1. trusted setup without the OpenAI key;
2. least-privilege Codex job with read access and controlled hook sources;
3. capture result or patch as an artifact;
4. separate job with repository write permission but no OpenAI key;
5. human review or protected pull request before merge.

A lifecycle hook can report or gate behavior inside the Codex run. GitHub Actions decides whether
the job fails, uploads an artifact, comments, pushes, or opens a pull request. Wire the handler exit
and Codex/action result into an explicit workflow condition; do not assume a model-visible warning
automatically fails CI.

## CI evidence

Report separately:

- workflow syntax/permission validation;
- local handler fixture results;
- local `codex exec` hook discovery/execution;
- action version and runner configuration;
- remote workflow conclusion;
- protected-branch/check enforcement.

Without an authorized push/run, remote GitHub Actions behavior is `NOT_VERIFIED`.
