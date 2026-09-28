## Context

Latest main a91368c includes PR #395 and the earlier BookList debounce optimization. The initial local suite passed 228 tests in 23.78s; BookList took 14.95s and import 6.39s. Preserve the test boundaries documented in the earlier audit.

## Goals / Non-Goals

Reduce avoidable test harness work while retaining assertions, async completion checks, and isolation. Do not change production behavior, dependencies, shared concurrency, timeouts, or browser coverage. Backend integration is CI-only for this task.

## Decisions

1. Trial a four-file BookList split with byte-identical describe blocks. Reject it: paired local median 28.938s → 30.225s, CI 18.197s → 19.087s. Additional initialization outweighs scheduling gains. Restore the original source.
2. Trial explicit Node environments for 14 audited DOM-independent files. Reject them: paired local median 28.677s → 29.407s, CI 14.017s → 14.402s. Restore all original environments.
3. Adopt per-page-fixture executable GraphQL schema reuse. Move createResolvers and makeExecutableSchema outside the request callback in e2e-mock-api/fixtures.ts. Each page fixture binds its own test-scoped MockStore; resolvers read current state on every operation. Never cache the schema globally or across tests.

The complete 53-test mock-API CI comparison gives wall medians 40.332s → 39.911s (-1.0%). Ranges overlap, so this is not conclusive evidence of a universal suite speedup. A mechanism benchmark of 100 fresh stores and ten reads each reduces schema/GraphQL execution time from a median 2362.382ms to 495.158ms (-79.0%). Adopt because it eliminates demonstrated repeated work with a minimal fixture-only change and no clear total-suite regression. Do not equate the mechanism result with browser-suite speedup.

## Measurement

Alternate baseline/candidate, candidate/baseline, baseline/candidate on the same runner. Unit experiments clear Vitest caches and verify all 228 full test identities. E2E measurements rebuild the same frontend each time, start a fresh server, disable retries, and verify all 53 identities pass on their first attempt. Include process startup and shutdown in wall time; E2E timing includes build/server startup too. Keep local two-worker and default four-CPU CI results separate. Record every run and reproducible experiment commit in docs/test-runtime-follow-up.md and the PR body. Remove temporary measurement jobs/scripts after collecting results.

## Risks / Trade-offs

- Reuse could share state → schema ownership remains inside the existing test-scoped page fixture, with a fresh MockStore for each test.
- Reuse could return stale snapshots → createResolvers callbacks read the live store; existing create/update/delete/import and history workflows verify subsequent reads.
- Small total-time differences may be noise → publish raw runs and overlapping ranges, and limit the strong performance claim to eliminated schema work.
- Eager construction adds work for pages without GraphQL requests → include all 53 tests, including pre-login cases, in the full-suite comparison.

## Validation and Delivery

All unit/component and browser test bodies remain unchanged. Run generation, lint, format, unit tests, and typecheck locally; run mock-API E2E locally and all CI suites. Scope is a fixture optimization, so the discarded split's shuffled-order experiment is no longer necessary. Synchronize the delta and archive OpenSpec separately from source changes. Track final CI and CodeRabbit review in the ExecPlan; do not merge.
