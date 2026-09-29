## Why

Issue #401 identified four medium-priority regression gaps that remain after PR #402: pending-author editing, author-deletion recovery, persisted book-edit fields, and import submission locking. Covering these user-visible boundaries strengthens existing tests without duplicating full CRUD flows or pursuing coverage percentage alone.

## What Changes

- Verify pending-author edits commit on Enter and blur, cancel on Escape, and remove empty names.
- Verify canceling author deletion does not mutate, and a failed deletion preserves the detail view and can be retried.
- Extend the existing mock-API all-fields book update flow to reopen the editor and verify every saved value.
- Verify preview/import submissions cannot run twice while pending and recover after completion or failure.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-behavior-contracts`: Add behavioral test requirements for editable pending authors, recoverable deletion, persisted edit fields, and import submission locking.

## Impact

- Vitest component tests for author selection, author detail, and book import.
- The existing mock-API Playwright book edit scenario.
- Production code only if the new regression tests reveal a missing user-visible guard or recovery behavior.
- No API, dependency, coverage configuration, worker, or timeout changes.
