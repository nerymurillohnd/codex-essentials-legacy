# Integration and Bundling

> Official sources: [Hooks](https://learn.chatgpt.com/docs/hooks),
> [Package your plugin](https://developers.openai.com/plugins/build/plugins),
> [Build skills](https://learn.chatgpt.com/docs/build-skills),
> [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), and
> [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
> Last verified: 2026-09-07.
> Recheck any custom-agent hook composition in the target release; do not infer native bundling.

Read this reference when adding a hook beside existing hooks or relating hooks to agents, subagents,
plugins, or skills.

## Inventory before integration

Inspect every applicable source without exposing secrets:

- `~/.codex/hooks.json`;
- hook tables in `~/.codex/config.toml` and selected profiles;
- `<repo>/.codex/hooks.json`;
- hook tables in `<repo>/.codex/config.toml`;
- enabled plugins and their manifest/default hook sources;
- visible managed hooks and `allow_managed_hooks_only` policy;
- custom-agent configuration used by the target flow;
- CI-specific `CODEX_HOME`, profile, and command-line overrides.

Record event, matcher, handler, sync/background mode, timeout, context output, source, and trust state.
Do not replace a complete event array to add one group unless the user explicitly approved that
replacement.

## Composition rules

- Active hook sources add together; config precedence does not remove lower-layer hooks.
- Multiple matching command handlers can start concurrently.
- Overlap can duplicate telemetry, repeat context, race writes, accumulate time, or return conflicting
  decisions.
- For `PermissionRequest`, any deny wins; otherwise an allow suppresses the prompt and no decision
  leaves the normal flow.
- For `Stop` and `SubagentStop`, any `continue: false` takes precedence over continuation decisions.
- Do not generalize those precedence rules to another event without its documented contract.
- Changing a non-managed definition changes its trust hash and requires renewed review.

## Relationship matrix

| Target              | Documented mechanism                                                                          | What it does not mean                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| User/project        | `hooks.json` or inline `[hooks]` in that config layer                                         | One layer does not override another hook source                                                       |
| Plugin              | Default `hooks/hooks.json` or manifest `hooks` entry                                          | Installation/enabling does not trust the hook                                                         |
| Subagent            | `SubagentStart`/`SubagentStop` matched by `agent_type`                                        | The hook is not installed inside the subagent                                                         |
| Custom agent        | Standalone TOML is a spawned-session config layer; other supported config keys may be present | Published docs do not explicitly promise inline hooks in custom-agent TOML; verify before claiming it |
| `AGENTS.md`         | Persistent instructions loaded into model context                                             | It is not executable lifecycle configuration                                                          |
| Skill               | Instructions, references, assets, and optional inert scripts                                  | Installing a skill does not register or activate hooks                                                |
| Skill inside plugin | Plugin can distribute skills and, separately, hook components                                 | The hook belongs to the plugin, not to an individual skill invocation                                 |
| OpenAI Agents SDK   | Its own agent runtime APIs and lifecycle concepts                                             | Not Codex `hooks.json`; do not translate fields by analogy                                            |

## Bundle hooks in a plugin

This is native bundling. Codex uses `hooks/hooks.json` by convention, or a manifest `hooks` field that
replaces the default source. The field may be one `./` path, an array of paths, an inline hook object,
or an array of inline objects.

```json
{
  "name": "repo-policy",
  "hooks": ["./hooks/session.json", "./hooks/tools.json"]
}
```

Paths must start with `./`, resolve from the plugin root, and remain inside it. Commands receive:

- `${PLUGIN_ROOT}`: installed plugin root;
- `${PLUGIN_DATA}`: writable plugin data directory;
- `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}`: compatibility aliases.

Inactive example:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${PLUGIN_ROOT}/hooks/session_start.py",
            "statusMessage": "Loading plugin context"
          }
        ]
      }
    ]
  }
}
```

Package handler scripts, tests, and runtime dependencies inside the plugin. Review containment,
permissions, data persistence, uninstall behavior, and trust before distribution.

## Bundle hooks with agents

There is no published plugin component that attaches a Codex lifecycle hook directly to an
`AGENTS.md` file or generic agent artifact:

- `AGENTS.md` contributes persistent model instructions; it does not execute lifecycle handlers.
- The `Agent` matcher alias identifies `spawn_agent` tool calls on tool lifecycle events; it is not
  an agent-package hook attachment.
- Standalone custom-agent TOML files are spawned-session configuration layers and can contain other
  supported config keys. The current custom-agent page does not explicitly name `[hooks]` among its
  examples, so inline custom-agent hooks must be verified against the target CLI before being
  promised.
- Plugin-bundled custom-agent artifacts are not established by the cited plugin packaging page.

When the objective is “apply behavior to agent activity,” prefer the explicitly documented tool or
subagent lifecycle event. When the objective is “ship one installable package,” bundle the hook and
skill as separate plugin components and keep agent configuration in its documented user/project
location unless current sources establish another mechanism.

## Bundle hooks with subagents

Use `SubagentStart` or `SubagentStop` in an ordinary active hook source and match the verified
`agent_type`. This can inject context, observe lifecycle, or request bounded continuation. It does not
attach a hook definition to the agent artifact.

If the desired behavior should apply only to a custom agent:

1. Verify its actual `name`/`agent_type`.
2. Prefer lifecycle targeting when that achieves the objective.
3. If considering inline hooks in the custom-agent TOML, verify current Codex behavior first: the
   custom-agent documentation calls the file a configuration layer and permits other supported
   config keys, but does not explicitly cite hooks as an example.
4. Report whether the result is documented, observed, inferred, or unsupported.

## Bundle hooks with skills

A skill can instruct Codex to design or create a hook and may contain scripts that run only when the
skill directs them. It cannot register lifecycle configuration merely by being loaded. To distribute
a skill and a hook together, package both as separate plugin components and document that enabling
the plugin exposes the hook to trust review independently of invoking the skill.

`hook-creator` itself intentionally declares only a skill. It teaches bundling but ships no active
hook component.

## Integrate safely

1. Inventory sources and trust state.
2. Map overlap by event and matcher.
3. Decide whether behavior is independent, must be consolidated, or must be ordered outside the
   concurrent hook dispatcher.
4. Merge the smallest structure without erasing unrelated groups.
5. Re-run isolated tests for every changed handler.
6. Reopen `/hooks`, review the new hash, and let the user decide trust.
7. Exercise the real event and check duplicate output, context, timeouts, races, and precedence.
8. Document exact disable/removal steps for only the added behavior.
