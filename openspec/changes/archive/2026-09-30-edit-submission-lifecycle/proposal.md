## Why

Editing a book or author currently allows repeated submissions while a save is in flight. A book edit can create authors before updating the book, so repeated submissions can also create duplicate authors.

## What Changes

- Guard the whole edit submission with an immediate lock and visible saving state.
- Keep book editing locked through pending author resolution, book update, and navigation.
- Release the lock after success or failure so an unsuccessful edit can be retried with its form values intact.
- Add regression coverage for repeated submissions, pending author resolution, and retry.

## Capabilities

### New Capabilities

- `edit-submission-lifecycle`: Single-flight save behavior and retry for book and author edits.

### Modified Capabilities

None.

## Impact

`BookEdit`, `AuthorEdit`, and their component tests. No API or dependency changes.
