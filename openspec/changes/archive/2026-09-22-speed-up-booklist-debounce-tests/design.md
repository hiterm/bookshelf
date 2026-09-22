## Context

`StringFilter` schedules `column.setFilterValue` through `useDebouncedEffect` with a fixed 1000 ms delay. The current `BookList.test.tsx` renders the complete Mantine table and Router for every case; string-filter cases therefore wait for that delay in wall-clock time. The existing hook tests already use fake timers. Previous splitting of the BookList file for parallelism did not improve CI time.

## Goals / Non-Goals

**Goals:** Preserve debounce and BookList behavior coverage, remove real-time debounce waits from ordinary BookList tests, and measure local and CI effects.

**Non-Goals:** Change the production debounce interval or API, split tests for parallelism, change Vitest configuration, or refactor BookList production code.

## Decisions

- Keep the hook's fake-timer tests and strengthen them only if the existing assertions fail to prove the latest dependency wins.
- Add a focused `StringFilter.test.tsx` using a minimal column stub and fake timers. It verifies immediate non-application, the 999 ms boundary, the 1000 ms application, cancellation of an earlier value, and synchronization from an external filter value.
- Mock `useDebouncedEffect` as `useEffect` in the ordinary `BookList.test.tsx` file. The test file continues to exercise table filtering, Router state, reset, sorting, pagination, and presets while avoiding the delay.
- Add one separate BookList test file without that mock. It uses fake timers and verifies a title input change remains unapplied at 999 ms, then updates both the table and URL at 1000 ms. A separate file makes the module-mock boundary explicit; this split is not a parallelism optimization.
- Record multiple sequential local runs before and after the change, plus CI timing for the PR. Compare medians and treat small runner differences as inconclusive.

## Risks / Trade-offs

- Fake timers can interfere with Router and Testing Library asynchronous work. Keep real timers for initial rendering, switch to fake timers around the focused input operation, and use React `act` when advancing them.
- The ordinary BookList mock no longer tests its real timing. The hook test, focused component test, and one unmocked BookList integration test retain that coverage.
- Adding a test file has startup cost. CI measurements determine whether the saved waits exceed that cost.

## Migration Plan

This change only edits tests and documentation. Revert the test commit if CI timing or reliability regresses.

## Open Questions

The CI performance effect remains to be measured on the PR runner.
