## Why

Issue #401 identifies unprotected cache, external-detail, and compound book-registration boundaries despite broad CRUD coverage. PR #395 established that regression assertions must observe completed asynchronous work; its cache follow-up remains valuable.

## What Changes

- Add real QueryClient regression tests for author merge and book update, observing active list/detail/related/history data across mutations and failures.
- Add OpenBD detail transformation, error, stale completion, reset, and preview-selection tests.
- Test autofill author normalization and registration failure/retry, including duplicate submission during author creation. Fix only behavior demonstrated by regression tests.
- Preserve existing suite isolation, test settings, and coverage scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-behavior-contracts`: Require observable cache coherence, external-detail safety, and compound registration regression coverage.

## Impact

Vitest tests around book/author hooks and book registration components; small production corrections if the new tests demonstrate stale data or duplicate submissions. No dependencies, API contract, global test configuration, or historical artifacts change. Real-backend integration runs in CI.
