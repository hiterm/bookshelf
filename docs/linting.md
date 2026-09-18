# Linting

Run `pnpm lint` to check the repository and `pnpm lint:fix` to apply safe
fixes. Both commands use Oxlint. Warnings fail the check.

`.oxlintrc.json` enables the correctness and suspicious categories for the
native ESLint, TypeScript, React, and import plugins. Selected strict and style
rules, plus bookshelf's rule options, are listed individually. A small set of
category rules is disabled to retain the project's existing conventions.

Type-aware TypeScript rules run through `oxlint-tsgolint`; keep
`options.typeAware` enabled and run `pnpm run generate` before linting. Build
output, generated code, and the listed tooling files are ignored. Formatting
is handled by `oxfmt` through `pnpm run format`.
