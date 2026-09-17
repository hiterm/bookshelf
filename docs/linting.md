# Oxlint migration notes

The repository uses Oxlint 1.83.0 with `oxlint-tsgolint` for type-aware
TypeScript rules. `.oxlintrc.json` was generated from the former ESLint flat
config with `@oxlint/migrate --type-aware --with-nursery --js-plugins=false`,
then adjusted for this repository. `pnpm lint` treats warnings as failures.
The `eslint-disable` comments remain supported by Oxlint.

## Differences from ESLint

- `no-restricted-syntax` is not implemented in Oxlint. The former test-file
  rule rejected string paths to local `use*` hooks in `vi.mock(...)` and asked
  for `vi.mock(import(...))`. Oxlint cannot enforce that project convention.
- `import/no-unresolved` is not implemented by Oxlint. The TypeScript
  compiler still checks TypeScript module resolution, but lint no longer
  checks unresolved imports independently, particularly in JavaScript files.
  The former TypeScript and Node import resolvers were therefore removed.
- `react-hooks/config` and `react-hooks/gating` were skipped by the migration
  tool because Oxlint uses fixed React Compiler options and does not expose
  gating options. This repository does not configure React Compiler or its
  gating, so these skips do not change an active project policy.
- `no-dupe-args` and `no-octal` are superseded by strict mode;
  `react/jsx-uses-vars` is covered by `no-unused-vars`; and
  `react/no-deprecated` is covered by `typescript/no-deprecated`, according
  to the migration tool. These are not independent Oxlint rules.
- The ESLint `react.version: "detect"` setting is not supported. Oxlint uses
  the explicit React version in `.oxlintrc.json`. The old import plugin's
  per-file resolver settings were not migrated.
- React Hooks rules use the `react/` prefix in Oxlint. Existing
  `react-hooks/` disable comments are accepted, but Oxlint does not report
  the `set-state-in-effect` case suppressed in `StringFilter.tsx`. This is
  an observed behavior difference between the implementations.

Type-aware linting was checked with a temporary `Promise.resolve(1);` in
`src/`: Oxlint reported `typescript/no-floating-promises`. The temporary
file was removed.
An `interface` in a temporary file produced a
`typescript/consistent-type-definitions` warning and made `pnpm lint` fail.
