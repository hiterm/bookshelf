## Context

The frontend has ten component names that no longer clearly communicate their
current responsibilities. The refactoring spans book and author feature
components, a shared utility component, routes, consumers, and tests.

## Goals / Non-Goals

**Goals:**

- Align each scoped filename, exported identifier, prop type, import, and test
  name with its current responsibility.
- Preserve behavior and DOM output.

**Non-Goals:**

- Change UI, data fetching, event handling, APIs, routes, or GraphQL schema.
- Correct the existing `src/components` directory spelling.
- Rename components outside the ten scoped mappings.

## Decisions

- Use Git-aware file moves and identifier-only edits so version history remains
  clear. Broad restructuring was not chosen because it could alter behavior.
- Update all active source and test references in the same refactoring change.
  Compatibility exports were not chosen because old names must no longer remain
  in current code.

## Risks / Trade-offs

- Missed imports or test references could cause compilation failures → search
  for every old identifier and run the existing verification suite.
- Pure renames can generate noisy diffs → keep formatting and unrelated edits
  out of the change.
