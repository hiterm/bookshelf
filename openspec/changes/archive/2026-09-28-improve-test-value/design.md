## Context

The repository has Vitest logic/component tests, Playwright with a per-test Node mock store, demo Playwright using browser service-worker state, and real-backend Playwright. Similar CRUD scenarios across those boundaries have independent value. The audit prioritizes false positives over coverage percentages.

## Goals / Non-Goals

**Goals:** deterministic asynchronous regression checks, truthful test names, reduced same-suite duplication, and a documented audit with concrete follow-ups.

**Non-Goals:** production changes, global test harness rewrites, new test dependencies, concurrency tuning, or running real-backend integration locally.

## Decisions

- Use controlled promises and awaited React `act` to finish stale work before assertions. Lookup searches expose their own completion promise; file reads are settled inside asynchronous `act`. Avoid sleeps and negative `waitFor` checks that can pass before work runs.
- Exercise stale lookup success, failure, enrichment, and reset separately because distinct asynchronous boundaries can overwrite state. Keep helpers local unless reused meaningfully.
- Reveal hidden import rows after bulk deselection and selection. Checking only the visible count cannot prove hidden state preservation.
- Consolidate debounce boundary assertions in one lifecycle test and add unmount cancellation, retaining dependency-change coverage.
- Remove book navigation-only and add-dialog-only mock E2E tests; their exact assertions remain in detail and create workflows. Preserve suites with different API/runtime boundaries.
- Use temporary mutations of race guards and selection logic as evidence; restore production source immediately after each experiment.

## Risks / Trade-offs

- Removing smoke tests could hide unique assertions → map each removal to retained same-suite assertions.
- Broad shared setup extraction could change isolation → defer it; keep this implementation scoped to behavioral tests.
- Mutations temporarily break source → use scripted `try/finally` restoration and verify the final diff contains no production edits.
