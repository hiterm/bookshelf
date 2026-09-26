# Vitest performance investigation (2026-09-26)

## Baseline and bottleneck

The baseline is main commit `6df6c17b09e5dda22c02a91ff7a1f91b79348f6e`,
with Vitest 5.0.1, jsdom 30.0.1, Node 24, and the existing `vmThreads` pool.
[Main CI run 35556040824](https://github.com/hiterm/bookshelf/actions/runs/35556040824)
passed 41 files and 223 tests in 21.24 seconds. `BookList.test.tsx` took
17.896 seconds, and `BookImportPage.test.tsx` took 6.040 seconds. Files run in
parallel, so their times cannot be added to obtain suite wall time.

Vitest attributed 66% of aggregated phase time to tests, 13% to import, 10% to
environment, 6% to setup, 3% to workers, and 1% to transform (rounded). The long
BookList file and its actual test execution are the first optimization target.
The earlier vmThreads change already reduced environment startup overhead.

Five BookList tests change string filters and wait for a production 1000 ms
debounce: author reading, title, ISBN, and two reset cases. These waits alone
add approximately five seconds to a file whose cases run sequentially.

## Change

`changeStringFilter` temporarily enables Vitest fake timers around the input
change, advances the real debounce implementation inside React `act`, flushes
pending simulated timers, and restores real timers in `finally`. Subsequent
router assertions and user interactions use real timers. All existing DOM,
filter, reset, and URL assertions remain; production debounce code is unchanged.
Existing `useDebouncedEffect.test.ts` tests still verify that the callback waits
for its delay and that changing dependencies restarts the timer.

## Measurement method

The draft PR used a temporary `Vitest paired measurements` CI job and
`scripts/measure-vitest.py`. The script swapped only BookList's test source between
the fixed main baseline and the candidate, preserving all other inputs. It runs
both variants three times on the same `ubuntu-latest` runner in the order
baseline/candidate, candidate/baseline, baseline/candidate. Each process gets a
cold `node_modules/.vite/vitest` cache, including scheduling history. The job
uses normal CI parallelism, the same installed dependencies, generated files,
and default/JSON reporters for every run. Any failure or unexpected test count
fails the experiment; candidate source is restored in `finally`.

Process wall time includes pnpm, Vitest startup, and shutdown. BookList time is
the JSON reporter's end time minus start time. Compare medians and individual
runs; small samples demonstrate this change's effect on this runner, not a
universal speedup or a statistically precise estimate. Installation, generation,
build, and E2E job times are outside these unit-suite measurements.

## CI results

[Paired measurement job](https://github.com/hiterm/bookshelf/actions/runs/36256488211/job/108444129541)
at candidate commit `961ab99` used a 4-vCPU AMD EPYC 9V45 runner with Node
24.21.0. All six runs passed 41 files and 223 tests.

| Order | Variant   | Process wall (s) | Vitest duration (s) | BookList (s) |
| ----- | --------- | ---------------: | ------------------: | -----------: |
| 1     | Baseline  |           13.723 |               12.86 |       10.901 |
| 2     | Candidate |           10.262 |                9.38 |        7.638 |
| 3     | Candidate |           10.129 |                9.27 |        7.411 |
| 4     | Baseline  |           13.565 |               12.70 |       10.873 |
| 5     | Baseline  |           13.441 |               12.56 |       10.703 |
| 6     | Candidate |           10.261 |                9.40 |        7.545 |

Median process wall time fell from **13.565s to 10.261s (24.4%)**. Median Vitest
reported duration fell from **12.70s to 9.38s (26.1%)**. Median BookList time
fell from **10.873s to 7.545s (30.6%)**. Every candidate run was faster than
every baseline run on this runner. Accept the scoped fake-timer change.

The ordinary CI test job on a separate runner reported 18.53s and BookList
15.092s. The older main CI reported 21.24s, but runner differences make that
historical comparison unsuitable for attributing the improvement. Use the
paired results above, not cross-runner absolute times, as the evidence.

The same CI run passed generation checks, lint, formatting, type checking,
build, mock-API E2E, demo-mode E2E, and both backend integration variants.
The temporary measurement job and script are removed from the final change,
so future CI runs do not pay for six extra test executions.

To reproduce the exact experiment, check out candidate `961ab99` in a clean
checkout, install with `pnpm install --frozen-lockfile`, run `pnpm run generate`,
and run `GITHUB_STEP_SUMMARY=/tmp/vitest-summary.md python3
scripts/measure-vitest.py`. Use a runner matching the recorded CPU and Node
version for comparable absolute times. The script temporarily overwrites
BookList and restores it; do not run concurrent tests or edits in that checkout.
The [measurement script at the experiment revision](https://github.com/hiterm/bookshelf/blob/961ab99/scripts/measure-vitest.py)
and CI logs retain the exact protocol after removal from the branch tip.

## Local validation

Use `pnpm run test --maxWorkers=2` on the constrained local machine. This is an
environment-only override, not a shared configuration change. Initial baseline:
25.33 seconds for the suite and 19.755 seconds for BookList. Initial prototype:
14.977 seconds for BookList; its full-suite timing overlapped generation and
formatting and is excluded from comparison. These observations identify the
candidate; CI measurements determine acceptance.

## Other approaches considered

Moving pure logic tests to a Node environment could reduce their environment
cost, but it does not directly remove the long BookList file from the critical
path. Revisit this after profiling the remaining workload. Tests that parse
HTML and React hooks still need a DOM; a blanket `.test.ts` rule would be wrong.

Splitting BookList into multiple files could distribute its remaining rendering
work across workers, but duplicates setup/import costs and may offer less on
small runners. It needs its own CI comparison before adoption. More workers
should likewise be benchmarked on CI rather than inferred from this local host.

Disabling isolation or replacing jsdom with another DOM implementation changes
test semantics and compatibility. Since vmThreads is already enabled and the
current improvement is localized, neither is necessary for this change.

Reducing production debounce delays, replacing meaningful component tests with
mocks, or dropping assertions would change what is being validated. The scoped
clock approach avoids those changes.

## References

- [Vitest performance profiling](https://vitest.dev/guide/profiling-test-performance)
- [Vitest fake timer APIs](https://vitest.dev/api/vi.html#vi-usefaketimers)
- [Testing Library fake timer guidance](https://testing-library.com/docs/using-fake-timers/)
