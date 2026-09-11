# Plugin Package Guidelines

These instructions apply to every local package under `plugins/`. The root
`AGENTS.md` and its linked policies continue to apply.

## Generated Metadata and Package Containment

Each `plugins/<plugin-id>/.codex-plugin/plugin.json` is the authored source of
truth for that distributable plugin. Start it from
`templates/codex-plugin-plugin.json`, complete its variable fields, and remove
optional declarations for components the plugin does not use. The generator
derives only `.agents/plugins/marketplace.json`; it never rewrites a plugin
manifest or skill metadata.

`SKILL.md`, `README.md`, and `CHANGELOG.md` remain author-owned package files.
The marketplace pipeline validates their package context but does not replace
their content.

Every file, directory, asset, symlink target, executable, and declared runtime
path used by an installed plugin must resolve within `plugins/<plugin-id>/`.
Plugins must not import, execute, reference, or depend on `lib/`, repository
maintenance tooling, another plugin, or another path outside their own package.
This rule applies after symbolic-link canonicalization and is enforced before
generation, validation, packaging, and release.

## Package Layout and Identity

- Place each package at `plugins/<plugin-id>/`.
- Every local package must contain
  `plugins/<plugin-id>/.codex-plugin/plugin.json`.
- `<plugin-id>` must match the manifest `name` and satisfy the identifier rules
  in `lib/schemas/plugin.schema.json`.
- Keep plugin resources inside the package. Do not create a repository-level
  `skills/` directory; skill content belongs in `plugins/<plugin-id>/skills/`.
- Every distributed skill at `skills/<skill-id>/SKILL.md` must include its
  Codex-facing agent manifest at `skills/<skill-id>/agents/openai.yaml`. The
  skill document owns behavior and operating instructions; the agent manifest
  owns concise presentation metadata and optional prompt bootstrap.

The manifest must validate against `schemas/plugin.schema.json`. Its required
top-level fields include identity, ownership, legal metadata, keywords, and
`interface`. The interface requires display metadata, capabilities, legal URLs,
and an array `defaultPrompt`. At least one of `skills`, `hooks`, `apps`, or
`mcpServers` must be declared.

## Referenced Resources

- Declare `skills` only when `./skills/` exists.
- Start every `agents/openai.yaml` from `templates/agents-openai.yaml` and
  validate it against `schemas/agent.schema.json`. The required
  `interface.display_name`, `interface.short_description`, and boolean
  `policy.allow_implicit_invocation` identify the skill and declare whether
  normal automatic discovery is permitted. Set it to `true` for routine skills;
  use `false` only when explicit user invocation is an intentional product
  boundary. An optional `interface.default_prompt` may frame the first request;
  it must not repeat the skill's operating procedure.
- Agent icon paths are optional. When declared, keep them `./assets/`-relative
  and resolving inside the owning skill directory, including after symbolic-link
  canonicalization. Do not add unsupported YAML fields,
  use traversal paths, or place credentials in agent metadata.
- Declare `apps` as `./.app.json` and `mcpServers` as `./.mcp.json` only when
  those files exist; inline MCP definitions are also permitted by the schema.
- Keep interface assets under `./assets/`; screenshot paths must point to PNG
  files. Do not use `..` path segments.
- Codex supports explicit top-level `hooks` paths and automatically discovers
  `hooks/hooks.json` when the field is omitted. Declare
  `"hooks": "./hooks/hooks.json"` when the package uses the conventional hook
  file so the package contract is explicit.

## Hook Distribution Policy

Marketplace plugins must treat hooks as reference material by default. A plugin
may provide a skill, documentation, templates, examples, validation guidance,
and rollback instructions for consumer-owned hooks, but installation must not
create, register, enable, trust, or execute a hook in a user's global or
project configuration.

Consumer-owned hook handlers must use Bash (`.sh`) or Python (`.py`) unless
the user explicitly approves a different runtime before the handler is chosen.

When a user later requests hook behavior, the agent must use the installed
plugin's skill to assess the target environment, existing hook sources,
configuration, scope, runtime, and compatibility. It must present the exact
consumer-owned files and wiring, obtain explicit approval, then create or
merge only the approved configuration. The user remains responsible for
reviewing and trusting the resulting non-managed definition in `/hooks`.

Do not declare a plugin `hooks` component or add a package `hooks/` directory
unless a future user explicitly authorizes an exception to this policy and the
package documentation explains automatic installation behavior, trust, scope,
side effects, rollback, and compatibility consequences.

## Product Documentation

Every plugin product must include these files at its package root:

- `plugins/<plugin-name>/README.md`
- `plugins/<plugin-name>/CHANGELOG.md`

The plugin README must document its purpose, included components, supported
environments, inputs and outputs, required tools and credentials, permissions,
side effects, human-approval boundaries, installation behavior, uninstall or
rollback behavior, verification steps, known limitations, and failure and
recovery behavior.

The changelog must record every product-relevant change, including manifest,
skill, hook, script, MCP, app, permission, installation-behavior, security,
and breaking changes. Keep `README.md`, `CHANGELOG.md`, `plugin.json`, and the
marketplace registration synchronized in the same change. Product changes are
gated in pull requests; documentation-only changes may update only the
affected document.

Use the package's existing documentation as the canonical starting point.
Preserve Keep a Changelog headings, use ISO 8601 dates, and add migration notes
for breaking changes. Area labels are conditional metadata, not a checklist:
do not add entries for unaffected areas, and remove empty sections from the
`Unreleased` section.

## Catalog and Workflow

- Register local packages in `.agents/plugins/marketplace.json` with a local
  source path such as `./plugins/<plugin-id>`.
- Use the repository pipeline so manifests and catalog entries stay aligned:

  ```sh
  npm run marketplace:build
  npm run marketplace:check
  npm run check
  ```

Never commit credentials or real secret values in plugin files; use `${VAR}`
references and document required configuration instead. The generated catalog
must not be hand-edited.

## Consistency and Drift Review

Before merging any plugin change, verify these artifacts as one atomic set:

- `.codex-plugin/plugin.json`
- `skills/<skill-id>/SKILL.md` and `skills/<skill-id>/agents/openai.yaml`
- `README.md`
- `CHANGELOG.md`
- `.agents/plugins/marketplace.json`

Required consistency checks:

- `<plugin-id>` must match `plugin.json` name and marketplace `name`.
- Marketplace registration path must be `./plugins/<plugin-id>`.
- `plugin.json` is the sole version source; README files must not make a
  hard-coded version claim, and `CHANGELOG.md` must reflect manifest/versioned
  intent.
- Capability and installation claims in README should match actual files present
  (`hooks`, `skills`, `agents`, `references`, etc.) and runtime assumptions.
- Each `SKILL.md` must have exactly one schema-valid `agents/openai.yaml`; its
  catalog description and default prompt must accurately describe that skill,
  rather than the entire plugin.
- Any behavioral or compatibility change must appear in the Unreleased changelog
  before the change is released.
- Hook-path assumptions in docs must match runtime script behavior.

When any of these checks fail, pause merge and fix docs/manifest/catalog together
in the same change set.
