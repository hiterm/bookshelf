# Fix demo E2E test failures

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

PLANS.md is checked into the repo at `bookshelf/.agent/PLANS.md`. This document must be maintained in accordance with that file.


## Purpose / Big Picture

The repository ships a "demo mode" that lets anyone try the app without a real backend or Auth0 account. In demo mode, a browser-based request interceptor called MSW (Mock Service Worker — a library that registers a service worker in the browser to intercept `fetch` calls and return fake responses, eliminating the need for a real server) handles all GraphQL API calls. A separate Playwright E2E test suite in `e2e-demo/` validates this demo experience end-to-end by building the app, serving it with `vite preview`, and running browser automation against it.

Previously `npm run test:e2e:demo` (Playwright config: `playwright.demo.config.ts`) failed on every test. Users could not trust that the demo mode works correctly, and CI could not catch regressions. After this plan is complete, running the demo test suite with `--workers=4` produces all 6 tests passing, giving confidence that the demo experience is functional.


## Progress

- [x] (2026-03-27 14:30Z) Milestone 1: Reproduce failure and collect diagnostic evidence.
- [x] (2026-03-27 15:10Z) Milestone 2: Identify root cause from evidence and apply fix.
- [x] (2026-03-27 15:20Z) Milestone 3: Verify all demo E2E tests pass with `--workers=4`.

Note on worker counts: diagnostic and intermediate runs used `--workers=1` to minimise overhead and make logs easier to read. The final verification run in Milestone 3 used `--workers=4`, as required by the project's test execution rules.


## Surprises & Discoveries

- Observation: Playwright's network trace (`0-trace.network`) is 0 bytes even though the query reports `fetchStatus: fetching`. Playwright's CDP-based network recording does NOT capture fetch requests that are intercepted and fulfilled entirely by a service worker; those requests never reach the real network layer that CDP monitors.
  Evidence: `wc -c /tmp/trace-inspect/0-trace.network` → `0`. The manual `fetch('/api/graphql')` via `page.evaluate` confirmed MSW was working; the 0-byte file was a red herring for "no requests made."

- Observation: MSW `console.log` statements inside handlers do NOT appear in Playwright's trace console output. Handler code in MSW v2 runs in the browser page context (not the service worker context), so in theory logs should appear; however, Playwright's trace `screenshots: false, snapshots: false` config omits the DOM state but still captures console, and the handler log was absent. The likely reason is that the fetch never reached the MSW handler matching step — it failed before the handler could be evaluated. See root cause below.
  Evidence: After adding `console.log("[MSW handler] loggedInUser fired")` to the handler, no such log appeared in the trace, even though `fetchStatus: fetching` was observed.

- Observation: The root cause is that `graphql-request` v7 internally calls `new URL(params.url)` to normalise the URL before dispatching the fetch. When `params.url` is the relative path `/api/graphql`, this constructor throws `TypeError: Invalid URL` because the standard `URL` constructor requires an absolute URL or a base parameter. The `fetch()` API itself accepts relative paths and resolves them against the page origin, but `graphql-request` v7 does not use the same resolution strategy.
  Evidence: `node -e "new URL('/api/graphql')"` → `TypeError: Invalid URL`. The debug `page.evaluate` fetch using raw `fetch('/api/graphql', ...)` succeeded (status 200, correct JSON body), proving MSW was fine; only the `graphql-request`-mediated call failed.

- Observation: TanStack Query v5 retries failed queries three times with exponential backoff (approximately 1 s, 2 s, 4 s). During retries `isLoading` remains `true` and `error` remains `null` until all retries are exhausted. The test assertion timeout was 5 seconds, which expired while TanStack Query was mid-retry (total retry time ~7 s). This is why the observed state was `{ status: pending, fetchStatus: fetching, isLoading: true, hasData: false, hasError: false }` — the component was showing a Loader between retries, not a completed error state.
  Evidence: Single `[RegisterCheck]` log entry in trace, no error log, test timeout at ~5 s, confirmed by the retry timeline calculation.

- Observation: Playwright's accessibility snapshot (ARIA tree) does not show `<Center><Loader /></Center>` in the `<main>` region, even when the component is rendering it. Mantine's `<Loader />` renders as an SVG with `aria-hidden` or equivalent, which is excluded from the accessibility tree. `<Center>` is a plain `<div>` with no accessible role or label, so if its only child is aria-hidden it too is invisible to the accessibility snapshot. The main content area appearing "empty" in the snapshot was a misleading signal — the Loader was visually present.
  Evidence: DOM snapshot showed `- main [ref=e18]` with no children, but the screenshot (11 KB PNG) confirmed the Mantine AppShell was rendered correctly with a spinner in the content area.


## Decision Log

- Decision: Used `window.location.origin` to construct an absolute URL for `graphqlApiUrl` in demo mode (`src/config.ts`), changing `/api/graphql` to `` `${window.location.origin}/api/graphql` ``.
  Rationale: This is the minimal, direct fix for the root cause. `window.location.origin` is always defined in a browser SPA context; `src/config.ts` is only ever evaluated client-side. The alternative of making `graphqlApiUrl` a getter function would require updating every call site. Using an environment variable for the full URL would complicate the demo setup. The ExecPlan's Hypothesis C fix described exactly this approach.
  Date/Author: 2026-03-27

- Decision: Did NOT change `graphql.link("/api/graphql")` in `src/mocks/handlers.ts`. MSW correctly resolves relative URL paths in its matching logic using `location.href` as base; the handler was always matching correctly. The fix only needed to address the `graphql-request` side.
  Rationale: Verified by the `page.evaluate` debug test: a raw POST fetch to `/api/graphql` returned the correct mocked JSON, confirming MSW's matching was never broken.
  Date/Author: 2026-03-27

- Decision: Used a temporary `e2e-demo/debug.spec.ts` test with `page.evaluate` to directly call `fetch('/api/graphql')` from within the browser page context and inspect the response. This isolated MSW behaviour from `graphql-request` behaviour.
  Rationale: Standard Playwright `page.on('request')` and `page.route()` cannot intercept service-worker-handled requests. The only way to observe an MSW-intercepted response in the Playwright layer is via `page.evaluate`, which runs in the same browser context as the app. The debug test was deleted after root cause was confirmed.
  Date/Author: 2026-03-27


## Outcomes & Retrospective

All 6 demo E2E tests now pass in a single run with `--workers=4` in approximately 7 seconds total (including a 4-second build). The fix is a one-line change in `src/config.ts`.

The investigation took longer than expected due to two misleading signals: (1) the 0-byte Playwright network trace, which looked like "no requests were made" but actually meant "requests were made but intercepted by the service worker before reaching the network layer", and (2) the empty accessibility snapshot for the main area, which looked like "nothing rendered" but actually meant "the Loader is aria-hidden."

The key diagnostic breakthrough was writing a `page.evaluate` test that made a raw fetch directly from the browser context. This proved MSW was working, which narrowed the failure to the `graphql-request` call specifically. Inspecting `graphql-request` v7's source revealed the `new URL(params.url)` call that fails for relative URLs.

Lesson learned: when debugging MSW + Playwright, the standard Playwright network tooling is blind to service-worker-intercepted traffic. The correct diagnostic tool is `page.evaluate` with a raw fetch.

No follow-up work is required. The fix does not affect the non-demo code path (non-demo uses an absolute URL from `VITE_BOOKSHELF_API`).


## Context and Orientation

This section explains every relevant part of the repository so a complete beginner can navigate it.

**Repository root:** `bookshelf/`

**Technology stack.** The app is a React 19 SPA (Single-Page Application) built with Vite. Routing uses TanStack Router (`@tanstack/react-router`). Remote data fetching uses TanStack Query (`@tanstack/react-query`) together with `graphql-request` to call a GraphQL API. Authentication uses Auth0 (`@auth0/auth0-react`). The UI component library is Mantine.

**Demo mode.** When the environment variable `VITE_DEMO_MODE=true` is set at build time, Vite embeds the string `"true"` into the compiled bundle. The constant `isDemoMode` in `src/config.ts` evaluates to `true`. In this mode Auth0 credentials are intentionally empty (the real Auth0 tenant is not used), and all GraphQL requests go to the absolute path `http://<origin>/api/graphql`, which is intercepted by MSW instead of reaching a real server.

**MSW (Mock Service Worker).** MSW is a library that registers a browser Service Worker (a background script the browser runs separately from the page) that intercepts outgoing `fetch` requests matching defined patterns and returns programmatic responses. In this app, the MSW worker is set up in `src/mocks/browser.ts`, the request handlers are in `src/mocks/handlers.ts`, and the in-memory data store used by the handlers is `src/mocks/mockStore.ts`. The service worker script itself is the file `public/mockServiceWorker.js` (generated by MSW and committed to the repo). During a demo-mode build, `vite.config.ts` keeps `mockServiceWorker.js` in the `dist/` output; the `vite preview` server then serves it at `http://localhost:4173/mockServiceWorker.js`.

**App startup sequence.** The entry point is `src/index.tsx`. It runs an `async function main()` which, if `isDemoMode` is `true`, dynamically imports `src/mocks/browser.ts` and calls `await worker.start(...)` before doing anything else. Only after `worker.start()` resolves does it mount the React tree. `worker.start()` in MSW v2 waits until the service worker is both registered and active (controlling the page), so by the time React renders, MSW is ready to intercept requests.

**Component tree in demo mode.**

    QueryClientProvider (src/App.tsx)
      MantineProvider
        Auth0Provider  — initialized with empty domain/clientId (src/AuthGate.tsx)
          AuthGate
            RouterProvider  — mounted immediately; isDemoMode skips the Auth0 isLoading guard
              __root.tsx (RootComponent)
                RegisterCheck  — calls useLoggedInUser(), shows <Loader /> while pending
                  <Outlet />  — child route (e.g. /books renders BookIndexPage)

**Key files.**

- `src/index.tsx` — entry point; starts MSW then mounts React
- `src/config.ts` — exports `isDemoMode` and `graphqlApiUrl` (`window.location.origin + /api/graphql` in demo mode, after the fix)
- `src/AuthGate.tsx` — `AuthGate` skips Auth0 loading guard when `isDemoMode` is true; exports `AppRoot` which wraps `AuthGate` in `Auth0Provider`
- `src/App.tsx` — wraps everything in `QueryClientProvider` and `MantineProvider`
- `src/routes/__root.tsx` — root layout; contains `RegisterCheck` which queries `loggedInUser` before showing any page content
- `src/routes/index.tsx` — root `/` route redirects to `/books` when `isDemoMode` is true
- `src/routes/books/index.tsx` — books list page; calls `useBooks()`
- `src/routes/authors/index.tsx` — authors list page; calls `useAuthors()`
- `src/mocks/handlers.ts` — MSW request handlers for all GraphQL operations
- `src/mocks/mockStore.ts` — in-memory store; seeded with two authors and two books
- `playwright.demo.config.ts` — Playwright config for demo tests; sets `VITE_DEMO_MODE=true` in the `webServer.env` block and runs `npm run build && npm run preview`
- `e2e-demo/books.spec.ts` and `e2e-demo/authors.spec.ts` — the demo test files

**What the tests expect.** The books tests navigate to `/books` and expect to see links "テスト書籍1" and "テスト書籍2" (seeded in `mockStore`). The authors tests navigate to `/authors` and expect to see table cells "著者1" and "著者2". Both depend on the app successfully completing the `loggedInUser` query (to get past `RegisterCheck`) and then the `books` or `authors` query (to render data).

**Previously observed failure mode.** Every test timed out. The app rendered a `<Loader />` spinner (invisible in the accessibility tree due to Mantine's aria-hidden markup) and never transitioned to showing data. No GraphQL requests appeared in the Playwright network trace (because Playwright's CDP network log does not capture service-worker-intercepted requests). MSW was correctly enabled. The root cause was that `graphql-request` v7 calls `new URL(params.url)` internally, which throws `TypeError: Invalid URL` for relative paths like `/api/graphql`. This caused TanStack Query to silently retry the query three times with exponential backoff (~7 s total), and the 5 s test timeout expired before all retries exhausted and the error state became visible.


## Plan of Work

The work was divided into three milestones. Milestone 1 gathered evidence. Milestone 2 applied the fix. Milestone 3 verified all tests pass.


### Milestone 1: Reproduce failure and collect diagnostic evidence

The goal was to confirm which hypothesis was correct. Steps taken:

1. Ran the single test `"displays book list"` with `--workers=1` and observed the raw timeout failure.
2. Enabled lightweight tracing (`trace: { mode: "retain-on-failure", screenshots: false, snapshots: false, sources: false }`) in `playwright.demo.config.ts` and re-ran, collecting `trace.zip`.
3. Inspected `0-trace.network` (0 bytes — no CDP network events due to service worker interception) and all console entries in `0-trace.trace`.
4. Added a temporary `console.log` in `RegisterCheck` to capture `{ status, fetchStatus, isLoading, hasData, hasError }` → confirmed `fetchStatus: fetching`, `isLoading: true` at first render.
5. Added a temporary `console.log` in the `loggedInUser` MSW handler → log never appeared in the Playwright trace, narrowing the failure.
6. Created `e2e-demo/debug.spec.ts`: a temporary test that called `fetch('/api/graphql')` via `page.evaluate` after navigation. This fetch succeeded (status 200, correct JSON), proving MSW was intercepting correctly.
7. Inspected `graphql-request` v7 source (`node_modules/graphql-request/build/legacy/helpers/runRequest.js`) and found `let url = new URL(params.url)`. Confirmed with `node -e "new URL('/api/graphql')"` → `TypeError: Invalid URL`.

By the end of Milestone 1, the root cause was confirmed: `graphql-request` v7 cannot accept relative URLs; the `URL` constructor requires an absolute URL.


### Milestone 2: Identify root cause and apply fix

The fix matched the Hypothesis C path described in the original plan: change `graphqlApiUrl` in `src/config.ts` to produce an absolute URL in demo mode.

Changed `src/config.ts` from:

    export const graphqlApiUrl = isDemoMode
      ? "/api/graphql"
      : import.meta.env.VITE_BOOKSHELF_API;

To:

    export const graphqlApiUrl = isDemoMode
      ? `${window.location.origin}/api/graphql`
      : import.meta.env.VITE_BOOKSHELF_API;

Then removed all diagnostic code: reverted `RegisterCheck` and the MSW handler to their original forms, deleted `e2e-demo/debug.spec.ts`, and restored `playwright.demo.config.ts` to `trace: "off"` and `screenshot: "only-on-failure"`.

Ran `npm run typecheck` and `npm run lint` — both passed with no errors or warnings.


### Milestone 3: Verify all demo E2E tests pass

Ran the single test first as a sanity check (`--workers=1`, `"displays book list"`) → passed in 1.1 s.

Ran the full suite:

    npm run test:e2e:demo -- --workers=4

Output:

    Running 6 tests using 4 workers

      ✓  [chromium] › e2e-demo/books.spec.ts:3:1 › displays book list (401ms)
      ✓  [chromium] › e2e-demo/authors.spec.ts:3:1 › displays author list (547ms)
      ✓  [chromium] › e2e-demo/authors.spec.ts:10:1 › creates author and displays in list (582ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:65:1 › updates book (636ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:78:1 › deletes book (823ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:12:1 › creates book and displays in list (1.4s)

      6 passed (7.0s)

All 6 tests pass.


## Concrete Steps

All commands are run from the `bookshelf/` directory.

**Step 1 — Run a single test and observe raw output (completed).**

    npm run test:e2e:demo -- --workers=1 --grep "displays book list" 2>&1 | tail -60

Result: test failed with `Error: expect(locator).toBeVisible() failed` on `getByRole('link', { name: 'テスト書籍1' })` after 5.6 s.

**Step 2 — Enable lightweight tracing and re-run (completed).**

Edited `playwright.demo.config.ts` to add:

    trace: {
      mode: "retain-on-failure",
      screenshots: false,
      snapshots: false,
      sources: false,
    },
    video: "off",
    screenshot: "off",

    npm run test:e2e:demo -- --workers=1 --grep "displays book list" --reporter=list 2>&1 | tail -80

Trace written to `test-results/books-displays-book-list-chromium/trace.zip`.

**Step 3 — Inspect trace (completed).**

    unzip -o test-results/books-displays-book-list-chromium/trace.zip -d /tmp/trace-inspect
    wc -c /tmp/trace-inspect/0-trace.network   # → 0 bytes

Console logs extracted from `0-trace.trace`: only MSW activation messages and one `[RegisterCheck]` log showing `fetchStatus: fetching, isLoading: true, hasError: false`.

**Step 4 — Debug fetch isolation (completed).**

Created `e2e-demo/debug.spec.ts` with a `page.evaluate` call making a raw POST to `/api/graphql`. Test passed with:

    fetch result: { "ok": true, "status": 200, "body": "{\"data\":{\"loggedInUser\":{\"id\":\"test-user-id\"}}}" }
    service worker state: { "registered": true, "active": "activated", "controller": "activated" }

Inspected `node_modules/graphql-request/build/legacy/helpers/runRequest.js` → found `let url = new URL(params.url)`. Confirmed in Node.js: `new URL('/api/graphql')` → `TypeError: Invalid URL`.

**Step 5 — Apply fix (completed).**

Edited `src/config.ts`:

    export const graphqlApiUrl = isDemoMode
      ? `${window.location.origin}/api/graphql`
      : import.meta.env.VITE_BOOKSHELF_API;

Removed all diagnostic code: reverted `src/routes/__root.tsx`, `src/mocks/handlers.ts`, deleted `e2e-demo/debug.spec.ts`, restored `playwright.demo.config.ts` to original settings.

**Step 6 — Typecheck and lint (completed).**

    npm run typecheck   # → no errors
    npm run lint        # → no errors or warnings

**Step 7 — Verify all tests pass (completed).**

    npm run test:e2e:demo -- --workers=4
    # → 6 passed (7.0s)

**Step 8 — Report and wait for commit permission.**

All changes are ready. Waiting for user instruction before committing.


## Validation and Acceptance

Acceptance criteria met: running `npm run test:e2e:demo -- --workers=4` from the `bookshelf/` directory produced `6 passed` with no failures.

Each of the six tests passed:

- `e2e-demo/books.spec.ts` > "displays book list" — navigated to `/books`, found links "テスト書籍1" and "テスト書籍2". ✓
- `e2e-demo/books.spec.ts` > "creates book and displays in list" — created a book through the UI and it appeared in the list. ✓
- `e2e-demo/books.spec.ts` > "updates book" — edited a book title and saw confirmation text. ✓
- `e2e-demo/books.spec.ts` > "deletes book" — deleted a book and confirmed it was removed. ✓
- `e2e-demo/authors.spec.ts` > "displays author list" — navigated to `/authors`, found "著者1" and "著者2" in table cells. ✓
- `e2e-demo/authors.spec.ts` > "creates author and displays in list" — created an author and it appeared in the table. ✓

Unit tests (`npm run test`) also pass: `1 passed`.
Typecheck (`npm run typecheck`) passes: no errors.
Lint (`npm run lint`) passes: no errors or warnings.


## Idempotence and Recovery

All steps are safe to repeat. Running `npm run build` multiple times produces the same output. Running the test suite multiple times does not modify any source files.

If a fix attempt makes things worse, revert using:

    git checkout -- .

and restart from Step 1 of the Concrete Steps.


## Artifacts and Notes

Key evidence transcript from the debug fetch test:

    fetch result: {
      "ok": true,
      "status": 200,
      "headers": { "content-length": "47", "content-type": "application/json" },
      "body": "{\"data\":{\"loggedInUser\":{\"id\":\"test-user-id\"}}}"
    }
    service worker state: {
      "registered": true,
      "scope": "http://localhost:4173/",
      "active": "activated",
      "controller": "activated"
    }

Node.js confirmation of root cause:

    $ node -e "new URL('/api/graphql')"
    /api/graphql:1
    node:internal/url:907
          throw new ERR_INVALID_URL(input);
          ^
    TypeError [ERR_INVALID_URL]: Invalid URL

Final test run:

    Running 6 tests using 4 workers
      ✓  [chromium] › e2e-demo/books.spec.ts:3:1 › displays book list (401ms)
      ✓  [chromium] › e2e-demo/authors.spec.ts:3:1 › displays author list (547ms)
      ✓  [chromium] › e2e-demo/authors.spec.ts:10:1 › creates author and displays in list (582ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:65:1 › updates book (636ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:78:1 › deletes book (823ms)
      ✓  [chromium] › e2e-demo/books.spec.ts:12:1 › creates book and displays in list (1.4s)
      6 passed (7.0s)


## Interfaces and Dependencies

This plan introduced no new library dependencies. The existing dependencies are MSW v2 (`msw@^2.12.13`), Playwright (`@playwright/test@^1.58.2`), TanStack Query v5, and `graphql-request@^7.4.0`. No new interfaces or function signatures were introduced; the fix was a single-line configuration change in `src/config.ts`.

---

Revision note (2026-03-27): Filled in all living-document sections (`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, `Concrete Steps`, `Artifacts and Notes`) to reflect the completed investigation and fix. Root cause was Hypothesis C (relative URL incompatibility with `graphql-request` v7's `new URL()` call), not the originally most-suspected Hypothesis A. The fix is `window.location.origin + "/api/graphql"` in `src/config.ts`.