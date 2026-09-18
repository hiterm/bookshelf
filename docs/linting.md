# Linting

Run `pnpm lint` to check the repository and `pnpm lint:fix` to apply safe
fixes. Both commands use Oxlint. Warnings fail the check.

`.oxlintrc.json` enables Oxlint's correctness, suspicious, pedantic, and style
categories for the built-in ESLint, TypeScript, React, and import plugins.
Type-aware TypeScript rules run through `oxlint-tsgolint`; keep
`options.typeAware` enabled and run `pnpm run generate` before linting.

The explicit rules preserve bookshelf's chosen options and severity, enable
checks outside the selected categories, and turn off broad category rules
that conflict with the project's existing conventions. Build output, generated
code, and the listed tooling files are ignored. Formatting is handled by
`oxfmt` through `pnpm run format`.
