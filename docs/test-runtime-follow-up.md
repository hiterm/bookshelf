# Test runtime follow-up (2026-09-28)

Baseline: latest main `a91368c`, including PR #395. Historical reports
`docs/test-value-audit.md` and `docs/vitest-performance.md` remain unchanged.
This report records both successful and unsuccessful experiments.

## Invariants and scope

Keep all 228 test scenarios, their assertions, asynchronous completion checks,
and file isolation. Preserve the distinct responsibilities of unit/component,
mock-API browser, demo service-worker, and real-backend tests. Do not tune
shared worker counts, timeout values, or production debounce delays. Backend
integration is run only in CI for this investigation.

The initial exploratory local run used Node 24.18.0 and two workers: 41 files,
228 tests, Vitest duration 23.78s, BookList 14.952s, import 6.393s. These
uncontrolled exploratory timings identify candidates; use the paired results
below for adoption decisions.

## Unit-suite measurement protocol

Use the same dependencies, generated files, machine, and test command for each
pair. Alternate baseline/candidate, candidate/baseline, baseline/candidate.
Delete `node_modules/.vite/vitest` before each process, including dependency
optimization and test scheduling history. Wall time includes pnpm startup,
Vitest, and shutdown, but excludes installation, generation, build, and E2E.
Require all 228 tests to pass and compare the multiset of their full test names
against the first baseline. Restore candidate sources in `finally`.

Local runs use two workers on a two-CPU environment. CI uses default parallelism
on a four-CPU Ubuntu runner with Node 24.21.0. Do not mix their absolute times.
Six runs are a small sample, not a universal performance guarantee. No other
local tests, builds, or formatting run concurrently with the measurements.

## Experiment 1: split BookList describe groups — rejected

Move sorting, pagination, and presets/reset to separate files and extract
fixture/rendering support. All four describe blocks were byte-identical to the
baseline after formatting; all 228 scenarios remained. This shortened the
longest file but increased initialization and total work. The first exploratory
run failed one test because an exported fixture was missing; fix that before
measurement and exclude the failed run from results.

[CI paired job](https://github.com/hiterm/bookshelf/actions/runs/36418318607/job/108914692260)
at `22b340c`:

| Order | Variant   | Local wall (s) | CI wall (s) |
| ----- | --------- | -------------: | ----------: |
| 1     | baseline  |         28.938 |      18.394 |
| 2     | candidate |         31.177 |      19.087 |
| 3     | candidate |         29.531 |      19.173 |
| 4     | baseline  |         28.453 |      17.965 |
| 5     | baseline  |         29.046 |      18.197 |
| 6     | candidate |         30.225 |      19.082 |

Median local wall time increases from 28.938s to 30.225s (+4.4%). CI increases
from 18.197s to 19.087s (+4.9%). Reject and fully restore the original BookList
file. Remove the extracted helper and split files. Retain this failed experiment
in Git history, not in the final implementation.

## Experiment 2: explicit Node environments — rejected

Opt only audited DOM-independent files into Node using a per-file directive.
Keep shared vmThreads isolation, default jsdom, setup, and concurrency intact.
No test bodies or production sources change.

| Area                   | Files                                                           | Why Node is sufficient                                                           |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Search and author data | bookSearch, resolvePendingAuthors, displayAuthorYomis           | Zod validation, explicit async callbacks, string/array transformations           |
| Book entities          | Book, BookFormat, BookStore                                     | Timestamp conversion and enum labels                                             |
| Import data            | importSelection, toImportBookInput, filterImportedBooks         | Set immutability, input conversion, date filtering; parser imports are type-only |
| History                | operationType                                                   | Operation label mapping                                                          |
| Error data             | appError                                                        | GraphQL error normalization, redaction, formatted text; no clipboard access      |
| Mock data              | src/mocks/mockStore, src/mocks/handlers, e2e-mock-api/mockStore | Store operations and purchase-date mapping; no DOM or service-worker startup     |

Keep parseKindleExport in jsdom because it parses HTML. Keep React hooks and
components in jsdom even if their filename ends in `.test.ts`. Keep backupDownload
in jsdom because it exercises browser download behavior. Browser service-worker
and real-backend integration still run in their original suites.

All 228 tests passed. Coverage totals matched the split experiment's unchanged
assertions: statements 57.35%, branches 45.02%, functions 56.12%, lines 57.73%.
That supports consistency, but coverage alone does not establish test quality.

[CI paired job](https://github.com/hiterm/bookshelf/actions/runs/36418912888/job/108916629570)
at `21d40be`:

| Order | Variant   | Local wall (s) | CI wall (s) |
| ----- | --------- | -------------: | ----------: |
| 1     | baseline  |         28.677 |      15.148 |
| 2     | candidate |         28.202 |      14.687 |
| 3     | candidate |         30.108 |      14.402 |
| 4     | baseline  |         27.761 |      13.857 |
| 5     | baseline  |         29.877 |      14.017 |
| 6     | candidate |         29.407 |      14.219 |

Local medians are 28.677s baseline and 29.407s candidate (+2.5%); CI medians
are 14.017s and 14.402s (+2.7%). Ranges overlap. Reject this candidate because
there is no measured overall gain; restore all 14 original environments.

## Experiment 3: per-test GraphQL schema reuse — adopted

`e2e-mock-api/fixtures.ts` previously called `createResolvers(mockStore)` and
`makeExecutableSchema` on every GraphQL request. Move this construction into
the existing page fixture, immediately before registering the GraphQL route.
The route closes over that schema. Resolvers continue to read the same live
per-test store on every operation. Each new test gets its own store and schema;
there is no global or worker-scoped mutable cache. Request parsing, schema
validation, GraphQL execution, responses, and all 53 browser tests stay intact.

The mock-API E2E paired experiment at `9ac9362` uses the same alternating order
on one four-CPU CI runner, Node 24.21.0. Each invocation removes `dist`, builds
the frontend, and starts a fresh preview server (`CI=true`). No build is skipped
or existing server reused. Use default workers, disable retries for measurement,
and require exactly 53 identical full test identities to pass on their first
attempt. Wall time includes build, server startup, tests, and shutdown. The
Playwright-reported duration also includes its web-server startup; it is not a
browser-test-only measurement. Installation and generation are outside timing.

[CI paired job](https://github.com/hiterm/bookshelf/actions/runs/36419477363/job/108918470112):

| Order | Variant   | Process wall (s) | Playwright duration (s) |
| ----- | --------- | ---------------: | ----------------------: |
| 1     | baseline  |           42.366 |                  41.254 |
| 2     | candidate |           39.784 |                  38.773 |
| 3     | candidate |           41.111 |                  40.078 |
| 4     | baseline  |           39.917 |                  38.933 |
| 5     | baseline  |           40.332 |                  39.322 |
| 6     | candidate |           39.911 |                  38.914 |

Median wall time is 40.332s baseline versus 39.911s candidate (-1.0%, 0.421s).
Median Playwright duration is 39.322s versus 38.914s (-1.0%). Ranges overlap,
and one of the three adjacent pairs favors baseline. This is a small observed
change, not statistically conclusive evidence of a general suite speedup.

A separate local mechanism benchmark creates 100 fresh stores with ten GraphQL
reads each. Baseline builds 1,000 schemas; candidate builds 100. Both execute
all 1,000 queries and assert the returned book IDs/titles match the store. Run
in the same process in alternating order, with Node 24.18.0 and no concurrent
build/test workloads:

| Order | Variant   | Elapsed (ms) |
| ----- | --------- | -----------: |
| 1     | baseline  |     2686.809 |
| 2     | candidate |      490.535 |
| 3     | candidate |      495.158 |
| 4     | baseline  |     2225.216 |
| 5     | baseline  |     2362.382 |
| 6     | candidate |      507.552 |

Median mechanism time drops from 2,362.382ms to 495.158ms (-79.0%). This includes
schema creation, GraphQL execution/validation, store creation, and assertions;
it excludes browser work and does not represent the E2E workload's request
count. Schema validation can also reuse the schema's internal validation state.
The first run includes process warm-up, but the later baseline runs are still
much slower. Do not advertise 79% as an E2E speedup.

Adopt the small fixture-only change because it demonstrably removes repeated
work, preserves live store access and test isolation, and the complete E2E
comparison shows no clear regression. The measured total-suite effect remains
small and uncertain. No production code, test body, dependency, worker count,
timeout, browser isolation, or final CI configuration changes.

## Other approaches investigated

No fixed `waitForTimeout`, `sleep`, `setTimeout`, or `delay` calls were found in
the E2E suites. Reusing browser contexts would undermine demo store isolation;
retain new contexts. Mock-API stores remain per-test. Executable-schema construction was subsequently benchmarked as experiment 3.

The earlier BookList debounce optimization is already present. Reducing fixture
sizes risks losing pagination boundaries. Skipping accessible role checks,
disabling isolation, or replacing component tests with pure tests would weaken
the validation contract. Browser shim consolidation primarily improves
maintenance and lacks measured speed evidence. These are not adopted.

## Validation and reproduction

Generation, lint, formatting, 41 files / 228 unit tests, and all TypeScript
projects passed locally. Mock-API E2E passed all 53 tests locally (57.3s,
two workers; an exploratory validation run, not a controlled comparison).
All CI jobs passed at `9ac9362`, including coverage/build, generated files,
mock-API, demo, pinned-backend integration, and main-backend integration. No
real-backend integration was run locally. The final source diff is only the
schema construction move and explanatory comment; test bodies are unchanged.

The temporary CI job and Python script are removed from the final branch.
For exact paired reproduction, use a disposable checkout at the experiment
revision (`22b340c` split, `21d40be` Node, `9ac9362` schema). Install with
`pnpm install --frozen-lockfile`, run `pnpm run generate`, and execute
`python3 scripts/measure-test-runtime.py`. For the E2E revision first run
`pnpm exec playwright install --only-shell chromium`; ensure no process listens
on port 4173. Set `BENCH_WORKERS=2` only to reproduce the local override.
Never run concurrent tests or edits: the script swaps known sources, restores
them in `finally`, writes JSON/log files under a printed temporary directory,
and verifies all expected tests without retries. Preserve that directory if
you need detailed per-test timings. Failed or skipped tests fail the experiment.

The mechanism benchmark can be reproduced from the repository root with Node
24 using the following code through `node --input-type=module`:

```js
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphqlSync } from "graphql";
import { MockStore } from "./e2e-mock-api/mockStore.ts";
import { createResolvers } from "./e2e-mock-api/resolvers.ts";

const typeDefs = readFileSync("src/graphql/schema.graphql", "utf8");
const source = "{ books { id title } authors { id name } }";
for (const variant of [
  "baseline",
  "candidate",
  "candidate",
  "baseline",
  "baseline",
  "candidate",
]) {
  const start = performance.now();
  for (let page = 0; page < 100; page++) {
    const store = new MockStore();
    let schema;
    if (variant === "candidate")
      schema = makeExecutableSchema({
        typeDefs,
        resolvers: createResolvers(store),
      });
    for (let request = 0; request < 10; request++) {
      if (variant === "baseline")
        schema = makeExecutableSchema({
          typeDefs,
          resolvers: createResolvers(store),
        });
      const result = graphqlSync({ schema, source });
      assert.equal(result.errors, undefined);
      assert.deepEqual(
        JSON.parse(JSON.stringify(result.data.books)),
        store.getAllBooks().map(({ id, title }) => ({ id, title })),
      );
    }
  }
  console.log(variant, performance.now() - start);
}
```
