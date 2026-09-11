---
name: configure-ruff-after-edit
description: Use when auditing or proposing Ruff checks after Python edits. Require explicit approval before configuring or enabling any after-edit behavior.
---

# Configure Ruff After Edit

Help the user assess Ruff after-edit behavior without activating it by default.
Installing this plugin makes this skill discoverable only; it does not install
or enable a hook automatically.

## Authorization boundary

- Start with a read-only audit of the declared target and its existing Python,
  Ruff, Codex, and hook configuration.
- Before any mutation, obtain explicit approval for the complete proposed
  change set and establish project or user scope.
- Do not create, modify, replace, enable, trust, or register a hook without
  that explicit approval.
- Treat approval as item-specific. Stop and present a revised plan if the
  approved work requires a dependency, configuration, source, or scope change
  that was not approved.

## Scope and proposal

- Project scope applies only to the selected repository.
- User scope applies to the user's Codex configuration and can affect multiple
  repositories.
- Report the observed Ruff command, configuration, target files, expected
  after-edit behavior, permissions, side effects, rollback path, and the exact
  proposed changes before requesting approval.

## Boundaries

- This package ships no active plugin hook and no `hooks` directory.
- Discovery and planning are read-only.
- Plugin installation does not modify a target project or user configuration.
- Do not bypass validation, approval, trust, or repository controls to make an
  after-edit workflow appear to work.
