## Why

Inferred return types hide the public contract of frontend functions and make
changes to their results harder to review. Explicit return types should expose
those contracts while preserving contextual inference for inline callbacks.

## What Changes

- Enable Oxlint's `typescript/explicit-function-return-type` as an error with
  `allowExpressions: true`.
- Add meaningful return types to affected functions, including components,
  hooks, and utilities, without changing their runtime behavior.
- Document the lint policy and verify it with the existing frontend checks.

## Capabilities

### New Capabilities

- `frontend-function-return-contracts`: Defines explicit return types for
  frontend function declarations while allowing contextually typed expressions.

### Modified Capabilities

None.

## Impact

The change affects `.oxlintrc.json`, active lint documentation, and TypeScript
source and test files. It adds no runtime dependency or API behavior change.
