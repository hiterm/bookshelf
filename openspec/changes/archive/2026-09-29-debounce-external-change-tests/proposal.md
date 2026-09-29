## Why

Existing debounce tests cover hook cancellation and completed filter edits, but do not exercise external filter changes while an edit is pending. A stale edit could overwrite Reset or URL navigation without those tests detecting it.

## What Changes

- Audit hook and BookList coverage before adding tests.
- Add behavior-level regression coverage for pending edits interrupted by Reset, URL search updates, and history navigation where coverage is missing.
- Report any reproduced production defect and its proposed remedy before changing production code.
- Following the reproduced failure and user authorization, fix Reset cancellation in a separate commit after the failing tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-behavior-contracts`: Require externally interrupted debounce tests to observe input, visible books, and URL after pending work has settled.
- `book-list-composition`: Reset discards uncommitted filter drafts even when the URL already has no string filter.

## Impact

BookList component tests, mock-API browser tests, and a small Reset change in BookList/BookTable. No new dependencies. Real-backend integration runs remain in CI.
