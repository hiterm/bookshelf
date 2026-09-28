## Context

Main a91368c includes PR #395 and the earlier scoped debounce optimization. Baseline local Vitest passes 41 files / 228 tests in 23.78s; BookList takes 14.95s and import 6.39s. BookList remains a sequential critical path. Shared configuration uses isolated vmThreads and default file parallelism.

## Goals / Non-Goals

Preserve all test scenarios and assertions while reducing elapsed suite time. Do not alter production behavior, weaken accessibility queries, disable isolation, change shared worker limits, or remove cross-layer tests. Backend integration runs in CI only.

## Decisions

Experiment with splitting BookList's existing describe groups into independently scheduled files sharing a test-only fixture module. Each file retains its isolated VM, fresh DOM cleanup, router, QueryClient, and mocks. This distributes existing work rather than deleting it. Compare alternating baseline/candidate full-suite runs with identical worker counts and cold Vitest scheduling caches; verify exact full test names and outcomes, not counts alone. Reject the split if duplicated initialization outweighs scheduling gains.

Pure-test Node environments are lower priority because they do not shorten BookList's critical path and require auditing transitive DOM dependencies. Query shortcuts and reduced fixtures risk weakening accessible interaction or pagination boundary coverage. Global browser shim consolidation is maintenance work, not demonstrated speed improvement.

## Risks / Trade-offs

- Extra imports and setup per file → measure total suite wall time, including startup.
- Shared helper accidentally shares mutable state → retain file isolation and fresh router/QueryClient creation; verify randomized test order.
- Local two-worker gains may differ from CI → confirm paired measurements with default CI parallelism before acceptance.
- Timing noise → alternating runs and raw results; do not infer speedups from different runners.

## Migration Plan

Commit planning separately, implement the test-only split, validate, and synchronize/archive the delta in a separate commit. Revert the split if validation or performance fails. Preserve historical audit documents.
