# Reduce repeated frontend test work

This ExecPlan follows `.agent/PLANS.md`. Implementation is complete; final PR delivery is tracked in PR #399.

## Purpose / Big Picture

Reduce test harness overhead while keeping existing regression detection. Starting from freshly pulled main a91368c, investigate the slowest work and adopt only a small defensible change. The final implementation builds each mock-API executable GraphQL schema once per page fixture instead of once per request.

## Progress

- [x] (2026-09-28) Inspect PR #395, previous runtime evidence, and baseline profiles.
- [x] Trial BookList splitting with identical test bodies; reject the measured slowdown.
- [x] Trial Node environments for pure tests; reject the lack of measured improvement.
- [x] Adopt fixture-local schema reuse after complete E2E and mechanism measurements.
- [x] Validate all existing tests and document raw results and reproduction steps.
- [x] Synchronize completed delta requirements into the main specification.
- [ ] Archive the completed OpenSpec change in a separate rename-only commit.

## Surprises & Discoveries

The existing debounce optimization already removed five real-time waits. BookList remained the longest file, but splitting it increased overall time. Node environment overrides also failed to improve the suite. The final E2E improvement is small and uncertain despite a large reduction in the isolated schema-processing benchmark.

## Decision Log

On 2026-09-28, reject BookList splitting: CI median wall time increased from 18.197s to 19.087s. Reject Node overrides: CI medians were 14.017s and 14.402s, with overlapping ranges. Restore both experiments completely.

Adopt per-page-fixture schema reuse: CI mock-API median wall time changed from 40.332s to 39.911s, with overlapping ranges. A local benchmark of 100 fresh stores with ten reads each changed from 2362.382ms to 495.158ms. This proves removal of repeated work, not a 79% browser-suite speedup. The small change retains live store access and has no clear full-suite regression.

## Outcomes & Retrospective

All 228 unit/component and 53 mock-API scenarios remain unchanged. The final source diff only moves schema construction and adds an ownership comment in e2e-mock-api/fixtures.ts. Shared settings, production sources, dependencies, and historical reports remain unchanged. Full individual measurements and reproducible experiment revisions are recorded in docs/test-runtime-follow-up.md. Delivery requires final CI and CodeRabbit approval in PR #399, without merging; those external gates are recorded in the PR body rather than reopening completed implementation tasks.

## Context and Orientation

The mockStore fixture in e2e-mock-api/fixtures.ts is test-scoped. The page fixture receives that fresh store. createResolvers in e2e-mock-api/resolvers.ts returns callbacks that read or mutate the store when invoked, rather than storing snapshots. makeExecutableSchema combines those callbacks with the generated GraphQL schema. The route handler executes each request against this schema. Reuse is safe within the fixture, but moving the schema to module or worker scope would share test state and is prohibited.

## Plan of Work

The final change creates the executable schema immediately before the GraphQL page.route registration, then removes the same construction from the callback. The callback closes over its fixture's schema. All request parsing, validation, execution, and responses remain. Do not reapply the discarded test splits or environment overrides.

## Concrete Steps

From the repository root, run pnpm run generate, pnpm run lint:fix, pnpm run format, pnpm run test --maxWorkers=2, and pnpm run typecheck. Run pnpm run test:e2e:mock-api --workers=2 locally. Expect 228 unit tests and 53 mock-API tests to pass. Backend integration runs only in CI for this task.

For the exact comparison, use a disposable checkout at 9ac9362, install the frozen lockfile, generate, install Playwright Chromium, and run python3 scripts/measure-test-runtime.py. It alternates fixed-main and candidate fixtures six times, rebuilding the frontend and starting a fresh server each time. It requires all 53 test identities to pass without retries. The earlier rejected experiment scripts are preserved at 22b340c and 21d40be. The final branch removes all temporary measurement jobs and scripts.

## Validation and Acceptance

Generation, lint, format, unit tests, typecheck, and local mock-API E2E pass. Full CI at 9ac9362 passed coverage/build, generated files, mock API, demo, and both backend integration variants. Retain the fixture-only change for demonstrated removal of repeated schema work; report the whole-suite effect as small and uncertain. All test bodies are unchanged, so no shuffled-order check for the discarded file split is needed.

## Idempotence and Recovery

Only run source-swapping measurements in an otherwise idle disposable checkout; they restore candidate sources in finally. Do not run another server on port 4173. All implementation changes are reversible. Never merge this PR automatically.

## Artifacts and Notes

The report docs/test-runtime-follow-up.md contains all 18 paired runs, mechanism measurements, exact commands, limitations, and links to CI. PR #399 also carries the complete investigation and final review status. OpenSpec change reduce-test-runtime adds two requirements: preserve regression detection during runtime optimization, and constrain mock-API schema reuse to a test's store.

## Interfaces and Dependencies

Use the installed GraphQL, GraphQL Tools, and Playwright versions. There are no application interface changes or new dependencies. Reuse the existing test-scoped fixture lifecycle rather than adding a new shared cache.

Revised on 2026-09-28 after three experiments to describe only the adopted implementation and retain the unsuccessful evidence without executable obsolete instructions.
