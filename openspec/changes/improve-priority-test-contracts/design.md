## Context

Issue #401 and `docs/test-value-audit.md` identify cache integration, OpenBD details, and compound registration as high-value gaps. PR #395 already covers lookup races and ordinary CRUD browser flows. Start from latest main, `8250247`.

## Goals / Non-Goals

**Goals:** Observe real cache consumers and completed asynchronous work; protect external detail conversion and author registration recovery.

**Non-Goals:** Blanket hook coverage, coverage thresholds, duplicate CRUD E2E, global worker/timeout changes, or API changes.

## Decisions

- Use real query/mutation hooks with a fresh QueryClient per test and a controlled SDK boundary. Keep observers mounted with infinite stale time and automatic mount/focus/reconnect refresh disabled. Assert before/after data rather than invalidation call arrays. Merge covers author lists, both details, related books, and revisions. Book update covers book list/detail, affected author books, and book revisions; failed mutations preserve old data and permit retry. This is more focused than repeating navigation workflows.
- Use actual fetch responses and deferred promises for OpenBD. Exercise description priority, positive integer page counts, empty/malformed input, HTTP/network/JSON failures, stale success and each error exit, and reset. Await the hook's returned promise after settling old work. Preview tests cover selection despite detail failure and close/reset only.
- Exercise real Mantine forms and author resolution. Stub lookup results and mutation boundaries, then assert submitted form values, retained input, resolved IDs on retry, and one submission throughout author creation. Any demonstrated duplicate-submit/cache defect receives a minimal correction with a regression test.
- Keep existing test layers. Existing mock API and Demo suites verify browser and service-worker boundaries after production corrections; real backend suites run in CI.

## Risks / Trade-offs

- SDK fixtures can drift → use generated types and retain real API CI.
- Immediately true negative assertions can hide stale completions → explicitly settle and await deferred operations inside `act`.
- Active cache contracts exceed current invalidation → first reproduce the failure, then invalidate the affected query family without changing API semantics.
- Partial success among several concurrent author creations is a separate recovery policy; this change tests one pending author and book failure after successful resolution, without redesigning multi-author transactions.
