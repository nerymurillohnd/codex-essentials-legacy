# Codex Essentials Plugin Pipeline Protocol

Current package-local protocol. It supplements `SKILL.md` and does not
authorize publication or other remote actions.

## Change classification

- New plugin or component: author its manifest, resources, README, and
  changelog; run `npm run marketplace:build` and the documentation gate.
- Existing plugin file, including skill metadata, hooks, runtime resources, or
  manifest: update that package's README and CHANGELOG; run
  `npm run validate:plugins` and the documentation gate with the actual base
  and head revisions. If the manifest or catalog is affected, also run
  `npm run marketplace:build`.
- Repository tooling hook (`.codex/hooks.json` or
  `scripts/plugin-manifest-guard.cjs`), validator, generator, schema, template,
  release behavior, or test: run `npm run check`; add the documentation gate
  only when the same change touches `plugins/`.
- Documentation-only package correction: update only the affected document and
  run the applicable documentation gate.
- Release candidate: run `npm run check`, `npm run marketplace:check`,
  `npm run validate:release-workflow`, and `npm run validate:release-set -- --plan
<release-plan.json> [--archives]`.

Apply the union when a change spans categories. `npm run check` never replaces
the documentation gate for a non-document plugin change.

## Package contract

`plugins/<plugin-id>/.codex-plugin/plugin.json` is the authored source of truth
for that package's identity, version, interface, and declared components. Start
a new manifest from `templates/codex-plugin-plugin.json`; remove optional fields
for components the package does not contain. Do not create or restore
`lib/source.json`.

The following are author-owned and validated, not generated:

- `skills/<skill-id>/SKILL.md` and `skills/<skill-id>/agents/openai.yaml`;
- package-root `README.md` and `CHANGELOG.md`;
- declared hooks, apps, MCP configuration, assets, and runtime resources.

The package must work when archived alone. Every file, executable, asset,
symlink target, and runtime path must resolve inside the owning plugin; it must
not depend on `lib/`, another plugin, or repository-only tooling. A `skills`
component requires `./skills/`, and every skill directory requires `SKILL.md`
plus schema-valid `agents/openai.yaml`.

## Catalog pipeline

- `npm run validate:plugins` validates manifests, required documentation,
  resources, skill agent metadata, hooks, and containment.
- `npm run generate:marketplace` writes `.agents/plugins/marketplace.json` from
  validated manifests.
- `npm run validate:marketplace` validates the catalog schema and its exact
  reverse-link to manifests.
- `npm run marketplace:build` runs package validation, writes the catalog, and
  validates the result.
- `npm run marketplace:check` performs package and catalog validation without
  writing generated output.

Use `marketplace:build` after manifest or catalog-affecting changes. Use
`marketplace:check` when inspecting state. Never repair catalog drift by hand;
correct the package manifest and regenerate it.

The historical commands `scaffold:plugin`, `sync:all`, `sync:check`, and
`validate:all` are not current npm scripts and must not be prescribed.

## Quality and release

For documentation synchronization, run:

```sh
npm run documentation:gate -- --base <base> --head <head>
```

`npm run check` is the complete repository gate: formatting, linting, script and
TypeScript checks, tests and coverage, plus the read-only marketplace check.
Do not lower coverage thresholds to pass a change.

Release identifiers use exactly `plugin/<plugin-id>/v<semver>`. The release
contract validates exact component paths, SemVer, plugin changelog structure,
tag-to-manifest alignment, and the prohibition on package publication or
uploaded release assets. Passing validation is evidence only; it is not
permission to tag, push, publish, create a PR, merge, or perform another remote
action.

## Failure routing

- Package or containment failure: run `npm run validate:plugins`.
- Catalog schema or drift failure: run `npm run marketplace:build` and inspect
  the validated manifest if it still fails.
- Tooling, type, lint, test, hook, or schema failure: run `npm run check`.
- Release failure: compare the exact tag, manifest version, and dated changelog
  heading before any remote operation.
