## Why

The edit submission lifecycle currently uses a synchronous ref lock as well as
React state, copied from book creation. The ref covers submissions before React
can render, but the intended product behavior is to prevent repeated saves from
normal UI interactions. Keeping both mechanisms adds complexity without a
corresponding requirement.

## What Changes

- Define the duplicate submission guarantee in terms of user actions while the
  save button is disabled and loading.
- Apply the same submission behavior to book creation, book editing, and author
  editing without synchronous ref locks.
- Preserve full-flow busy state and retry behavior after failures.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `edit-submission-lifecycle`: Narrow the duplicate submission guarantee to
  normal UI actions and include book creation in the same contract.

## Impact

`AddBookButton`, `BookEdit`, `AuthorEdit`, their component tests, and the
`edit-submission-lifecycle` spec. No API or dependency changes.
