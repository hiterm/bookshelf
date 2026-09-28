# Reduce test runtime while retaining regression coverage

This living plan follows `.agent/PLANS.md`.

## Purpose / Big Picture

Reduce frontend test feedback time without deleting scenarios or weakening assertions. Compare passing full-suite executions against latest main a91368c, starting with the slow BookList component tests.

## Progress

- [x] (2026-09-28 11:48Z) Pull latest main, inspect PR #395 and historical performance report, and measure baseline.
- [ ] Split BookList describe groups and verify unchanged test bodies.
- [ ] Measure alternating baseline/candidate runs and validate isolation.
- [ ] Record results, synchronize/archive OpenSpec, and complete CI and review.

## Surprises & Discoveries

The existing debounce optimization already removes five real-time waits. The new baseline passes 228 tests in 23.78 seconds, with BookList taking 14.95 seconds. pnpm requires sandbox escalation to access its local database.

## Decision Log

On 2026-09-28, choose file-level scheduling as the first experiment because BookList dominates the critical path. Retain vmThreads isolation and every existing test body. Do not alter shared concurrency or production behavior.

## Outcomes & Retrospective

Investigation in progress; adoption depends on paired full-suite evidence.

## Context and Orientation

`src/features/books/BookList.test.tsx` contains shared router/provider setup and four describe groups. Vitest runs files in parallel but tests within each file sequentially. `vite.config.ts` specifies jsdom and isolated vmThreads. `docs/test-value-audit.md` records the regression boundaries to preserve; `docs/vitest-performance.md` is a historical report and must remain unchanged.

## Plan of Work

Extract fixture and rendering helpers into `src/features/books/BookList.test-utils.tsx`. Keep filters in the original test file; move sorting, pagination, and preset/reset groups verbatim to separate test files. Import shared setup in each file so each isolated VM registers its own mocks and browser shims. Do not import test files from other test files.

## Concrete Steps

From the repository root, run `pnpm run test --maxWorkers=2 --reporter=default --reporter=json --outputFile=/tmp/runtime.json`. Preserve a baseline copy outside the repository. Alternate baseline/candidate runs with the same dependencies, worker count, and cold Vitest cache, restoring candidate files in finally. Use JSON full test names to check all 228 tests pass. Repeat under default CI concurrency using a temporary measurement job; remove that job after recording its results.

## Validation and Acceptance

Run generation, lint, format, full tests, typecheck, and shuffled test order. Confirm mechanically that all BookList test bodies are identical after splitting. CI must pass unit coverage, build, mock-API, demo, and both real-backend integration variants. Never run backend integration locally. Accept only a measured elapsed-time improvement; distinguish local results from CI results. Request CodeRabbit review after CI and address feedback until approved.

## Idempotence and Recovery

Measurements only swap known test files in a clean checkout and restore them in finally. Keep logs in /tmp locally. Revert the candidate if slower. Keep OpenSpec and implementation commits separate; do not merge the PR.

## Artifacts and Notes

The initial baseline JSON and log are `/tmp/test-runtime-baseline.json` and `/tmp/test-runtime-baseline.log`. Final evidence belongs in a new investigation document and the PR body, including individual runs and rejected approaches.

## Interfaces and Dependencies

Use the installed Vitest, Testing Library, Mantine, and TanStack router/query versions. No dependencies or application interfaces change. The shared helper exports fresh-render functions and fixture factories, not shared rendered component instances.

Initial plan created after baseline profiling; implementation and acceptance remain pending.
