# Strict Ruff Profile Reference

Use this profile only after the user explicitly selects it. It is a reference
for an approved consumer-owned Ruff configuration; installing this plugin does
not create, copy, or activate it.

```toml
line-length = 100
indent-width = 4
force-exclude = true
# Preserve Ruff's standard exclusions and omit repository-specific generated files.
extend-exclude = [
  ".bzr",
  ".direnv",
  ".eggs",
  ".git",
  ".git-rewrite",
  ".hg",
  ".ipynb_checkpoints",
  ".mypy_cache",
  ".nox",
  ".pants.d",
  ".pyenv",
  ".pytest_cache",
  ".pytype",
  ".ruff_cache",
  ".svn",
  ".tox",
  ".venv",
  ".vscode",
  "__pycache__",
  "__pypackages__",
  "_build",
  "buck-out",
  "build",
  "dist",
  "node_modules",
  "site-packages",
  "venv",
]

[lint]
# Explicit selection (official recommendation)
select = [
  # Core
  "E",    # pycodestyle errors
  "W",    # pycodestyle warnings
  "F",    # Pyflakes
  "I",    # isort
  "UP",   # pyupgrade
  "B",    # flake8-bugbear
  "BLE",  # flake8-blind-except
  "SIM",  # flake8-simplify
  "C4",   # flake8-comprehensions
  "C90",  # McCabe complexity
  "A",    # flake8-builtins
  "COM",  # flake8-commas
  "DTZ",  # flake8-datetimez
  "T10",  # flake8-debugger
  "EXE",  # flake8-executable
  "FA",   # flake8-future-annotations
  "FBT",  # flake8-boolean-trap
  "ISC",  # flake8-implicit-str-concat
  "ICN",  # flake8-import-conventions
  "G",    # flake8-logging-format
  "INP",  # flake8-no-pep420
  "PIE",  # flake8-pie
  "PYI",  # flake8-pyi
  "PT",   # flake8-pytest-style
  "Q",    # flake8-quotes
  "RSE",  # flake8-raise
  "RET",  # flake8-return
  "SLF",  # flake8-self
  "SLOT", # flake8-slots
  "TID",  # flake8-tidy-imports
  "TC",   # flake8-type-checking
  "INT",  # flake8-gettext
  "ARG",  # flake8-unused-arguments
  "PTH",  # flake8-use-pathlib
  "TD",   # flake8-todos
  "FIX",  # flake8-fixme
  "ERA",  # eradicate
  "PD",   # pandas-vet
  "PGH",  # pygrep-hooks
  "PL",   # Pylint
  "TRY",  # tryceratops
  "FLY",  # flynt
  "NPY",  # NumPy-specific
  "PERF", # Perflint
  "FURB", # refurb
  "LOG",  # flake8-logging
  "RUF",  # Ruff-specific rules
  "ANN",  # flake8-annotations
  "D",    # pydocstyle
  "N",    # pep8-naming
  "S",    # flake8-bandit
]

# Rules that conflict with the formatter (official recommendation)
# + practical ignores for standalone scripts
ignore = [
  # === Formatter conflicts (must ignore) ===
  "W191",   # tab-indentation
  "E111",   # indentation-with-invalid-multiple
  "E114",   # indentation-with-invalid-multiple-comment
  "E117",   # over-indented
  "D203",   # incorrect-blank-line-before-class
  "D206",   # docstring-tab-indentation
  "D300",   # triple-single-quotes
  "Q000",   # bad-quotes-inline-string
  "Q001",   # bad-quotes-multiline-string
  "Q002",   # bad-quotes-docstring
  "Q003",   # avoidable-escaped-quote
  "Q004",   # unnecessary-escaped-quote
  "COM812", # missing-trailing-comma
  "COM819", # prohibited-trailing-comma
  "ISC002", # multi-line-implicit-string-concatenation

  # === Practical for standalone scripts ===
  "D100",   # Missing docstring in public module
  "D104",   # Missing docstring in public package
  "D213",   # Multi-line docstring summary should start at the second line
  "S101",   # Use of `assert`
  "INP001", # File is part of an implicit namespace package
]

fixable = ["ALL"]
unfixable = []

[lint.isort]
# Only formatter-compatible isort settings
force-sort-within-sections = true
combine-as-imports = true
order-by-type = true
# Do NOT use: force-single-line, force-wrap-aliases, split-on-trailing-comma

[lint.mccabe]
# Keep branching understandable in portable hooks and automation scripts.
max-complexity = 8

[lint.pydocstyle]
convention = "google"

[lint.flake8-annotations]
allow-star-arg-any = false
mypy-init-return = true
suppress-dummy-args = true
suppress-none-returning = false

[lint.flake8-tidy-imports]
ban-relative-imports = "all"

[lint.pycodestyle]
max-doc-length = 100

[format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
docstring-code-format = true
docstring-code-line-length = 100
```
