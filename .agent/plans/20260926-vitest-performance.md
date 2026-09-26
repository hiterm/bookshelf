# Measure and reduce Vitest execution time

This is a living ExecPlan maintained according to `.agent/PLANS.md`.

## Purpose / Big Picture

Reduce the time developers and CI spend waiting for the existing Vitest suite,
without weakening test assertions or changing application behavior. Validate
improvements on GitHub Actions because the local machine is resource constrained.

## Progress

- [x] (2026-09-26) Create `codex/vitest-performance` from main `6df6c17`.
- [x] Inspect configuration, test sources, and main CI timing.
- [x] Run a local baseline with two workers: 41 files, 223 tests, 25.33 seconds.
- [x] Verify a prototype replacing five real debounce waits with fake timers;
      all 223 tests pass, BookList drops from 19.755s to 14.977s locally.
- [x] Create draft PR #391; paired CI run 36256488211 passes all six measurements.
- [x] Retain proven improvement and document evidence in `docs/vitest-performance.md`.
- [x] Complete local generation, lint, formatting, 223 tests, and type checking
      after removing temporary measurement code.
- [x] Mark PR #391 ready after successful paired and ordinary CI validation;
      final CI after removal of the benchmark is tracked on the PR.

## Surprises & Discoveries

Main already uses `vmThreads`, a pool that reuses worker threads while giving
files separate VM contexts. Its latest successful CI run (35556040824) took
21.24 seconds; BookList alone took 17.896 seconds. The phase breakdown was 66%
tests, 13% import, 10% environment, 6% setup, 3% worker, 1% transform. These are
aggregated phase shares, not sequential portions of wall time.

Local BookList took 19.755 seconds. The first candidate took 14.977 seconds,
but full-suite time was 26.29 seconds while generation/formatting overlapped;
exclude this contaminated full-suite timing from comparisons. Five string-filter interactions each wait for
a real 1000 ms debounce, a delay before applying the last input. All tests use
jsdom, including pure logic tests, but execution dominates the current suite.

## Decision Log

Use local `--maxWorkers=2` only as a command-line override. Keep shared worker
counts, isolation, environment, and timeouts unchanged. CI will use normal
parallelism. First prototype fake timers scoped to filter changes, restoring
real timers in `finally`, rather than modifying production debounce behavior.

## Outcomes & Retrospective

Paired CI measurements on a 4-vCPU AMD EPYC 9V45 runner show median process
wall time improving from 13.565s to 10.261s (24.4%), and BookList improving from
10.873s to 7.545s (30.6%). All six runs pass 41 files and 223 tests. The normal
CI jobs also pass. Retain the scoped fake-clock change; remove temporary
benchmark infrastructure and finish final branch verification on PR #391, now ready for review.

## Context and Orientation

`vite.config.ts` configures Vitest 5.0.1, jsdom, vmThreads and
`src/test/setup.ts`. `.github/workflows/ci.yml` runs unit tests and separate
Playwright suites. `src/features/books/BookList.test.tsx` has 32 tests and is the
longest file. `src/features/books/StringFilter.tsx` uses a 1000 ms debounce via
`src/components/hooks/useDebouncedEffect.ts`; hook tests already verify delay
and reset behavior with fake timers (a simulated clock).

## Plan of Work

First validate the scoped fake-timer prototype against the full local suite.
Then add a temporary CI measurement job that runs the baseline and candidate
on the same runner repeatedly with alternating order and equivalent caches.
Compare full-suite wall time and BookList time, retaining all 223 assertions'
test cases. If further profiling identifies material opportunities, evaluate
one change at a time. Remove temporary experiment infrastructure after recording
results in `docs/`, run required checks, and make the draft PR ready.

## Concrete Steps

Work in `/home/hiterm/ghq/github.com/hiterm/bookshelf`. Run
`pnpm run test --maxWorkers=2 --reporter=default --reporter=json
--outputFile.json=/tmp/vitest-candidate.json` locally. CI should run
`pnpm run test` without local worker overrides. Before every code commit run
`pnpm run generate`, `pnpm run lint:fix`, `pnpm run format`, `pnpm run test
--maxWorkers=2`, and `pnpm run typecheck`. Use GitHub CLI to create a draft PR,
inspect CI logs, update its body, and mark it ready only after evidence supports
the final changes.

## Validation and Acceptance

Both variants must pass 41 files and 223 tests in repeated CI measurements.
Report individual runs and medians, with runner details and source revisions.
An accepted change must show a repeatable reduction, not just a favorable
single run. Existing mock-API, demo-mode, and integration CI remain required;
production behavior is unchanged. The temporary benchmark must fail on any
test failure rather than interpreting incomplete runs as faster results.

## Idempotence and Recovery

Keep the baseline revision fixed at `6df6c17b09e5dda22c02a91ff7a1f91b79348f6e`.
Save candidate test contents before swapping baseline files for measurements,
and restore them even on failure. Remove only known Vitest caches between
measurements. Do not change package-manager configuration or historical plans.

## Artifacts and Notes

Main baseline: https://github.com/hiterm/bookshelf/actions/runs/35556040824
Local raw reports: `/tmp/vitest-baseline.json`, `/tmp/vitest-baseline.log`.
The final documentation will retain CI evidence because local temporary files
are not permanent project records.

## Interfaces and Dependencies

Use existing Vitest fake timers, React Testing Library `act`, pnpm scripts,
and GitHub Actions. No new dependency or production interface is required.

Revision note (2026-09-26): created after baseline investigation to guide local
prototyping and controlled CI validation.

Revision note (2026-09-26): local prototype passes; add a temporary Python
measurement script and CI job for controlled baseline/candidate comparisons.

Revision note (2026-09-26): paired CI confirms the improvement; record all
measurements and reproduction instructions in docs, remove temporary CI overhead.
