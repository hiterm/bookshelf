## Context

PR #402 covered the high-priority contracts from Issue #401. Four medium-priority gaps remain across component-level interaction tests and one existing browser flow. The production import page already uses synchronous refs as submission locks, while the other areas primarily need assertions around user-observable state and persisted data.

## Goals / Non-Goals

**Goals:**

- Test final selected values rather than Mantine implementation details.
- Settle controlled promises before asserting failed deletion or import recovery.
- Increase the detection power of the existing all-fields E2E without adding another login or CRUD flow.
- Keep each test at the narrowest layer that exercises the relevant boundary.

**Non-Goals:**

- Exhaustive testing of Mantine, every import branch, or all CRUD success paths.
- Changes to API contracts, shared test concurrency, worker counts, timeouts, or coverage thresholds.
- Running the real-backend integration suite locally.

## Decisions

- Extend `AuthorsCombobox` component tests with a stateful wrapper and assert `onChange` values. This protects the application contract while allowing Mantine markup to evolve.
- Mock only the delete mutation and control rejection/resolution. Keep the real error provider so failure visibility and the retained detail view are observed together.
- Reopen the book editor inside the existing `updates all fields` Playwright scenario and assert control values. Detail view labels do not currently expose every persisted enum, numeric, and boolean value.
- Use deferred import promises and repeated user interaction in `BookImportPage` tests. Assert one mutation call while pending, then settle the promise and verify either navigation or a successful retry.

## Risks / Trade-offs

- [Portal and focus behavior can make pending-author tests brittle] → Query accessible edit controls and assert final values, with blur triggered through an explicit focus move.
- [A loading button may block the second click before the ref lock is exercised] → Keep the call-count assertion behavioral; either UI disabling or the synchronous lock satisfies the contract.
- [Reopening the editor lengthens one E2E] → Reuse the existing authenticated update scenario instead of adding a new test setup.
- [Error notifications may outlive a retry] → Assert recovery through mutation calls and navigation, not transient notification disappearance.
