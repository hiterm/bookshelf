# Linting

Run `pnpm lint` to check the repository and `pnpm lint:fix` to apply safe
fixes. Both commands use Oxlint. Warnings fail the check.

`.oxlintrc.json` enables the correctness and suspicious categories for the
native ESLint, TypeScript, React, and import plugins. Selected strict and style
rules, plus bookshelf's rule options, are listed individually. Three category
rules are disabled for project-specific reasons.
Side-effect imports are limited to CSS and the shared
`@testing-library/jest-dom/vitest` matcher registration in
`src/test/setup.ts`.
TypeScript's `noImplicitReturns` checks return paths; Oxlint's
`typescript/consistent-return` is disabled for this purpose.
The `typescript/explicit-function-return-type` rule requires a return type on
function declarations and methods. With `allowExpressions: true`, function
expressions and arrow functions can omit the annotation when their immediate
parent is not a variable declarator, method definition, default export, or
class property. This exemption includes callbacks, array elements, object
properties, parenthesized function expressions, and IIFEs. Use a meaningful
domain or library type for exported functions and hooks rather than widening
their return contracts.

Type-aware TypeScript rules run through `oxlint-tsgolint`; keep
`options.typeAware` enabled and run `pnpm run generate` before linting. Build
output, generated code, and the listed tooling files are ignored. Formatting
is handled by `oxfmt` through `pnpm run format`.
