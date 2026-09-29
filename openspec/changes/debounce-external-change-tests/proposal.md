## Why

Existing debounce tests cover hook cancellation and completed filter edits, but do not exercise external filter changes while an edit is pending. A stale edit could overwrite Reset or URL navigation without those tests detecting it.

## What Changes

- Audit hook and BookList coverage before adding tests.
- Add behavior-level regression coverage for pending edits interrupted by Reset, URL search updates, and history navigation where coverage is missing.
- Report any reproduced production defect and its proposed remedy before changing production code.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-behavior-contracts`: Require externally interrupted debounce tests to observe input, visible books, and URL after pending work has settled.

## Impact

BookList component tests and, where needed, mock-API browser tests. No new dependencies or planned production changes. Real-backend integration runs remain in CI.
