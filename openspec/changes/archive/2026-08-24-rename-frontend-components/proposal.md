## Why

Several frontend component names obscure the responsibilities they currently
perform. Renaming them makes feature ownership and intent clear while
preserving the application's behavior.

## What Changes

- Rename ten frontend components, their files, types, imports, and test names
  to reflect their current responsibilities.
- Keep UI behavior, data fetching, event handling, APIs, routes, and GraphQL
  schema unchanged.
- Keep the existing `src/compoments` directory spelling unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is an internal refactoring with no requirement-level behavior
change.

## Impact

Affected code is limited to the renamed frontend components, their consumers,
and their tests. There are no API, route, GraphQL schema, dependency, or UI
changes.
