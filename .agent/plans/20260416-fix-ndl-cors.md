# Fix NDL API CORS error in ISBN auto-fill

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Refer to `.agent/PLANS.md` for the full authoring and maintenance rules that govern this document.


## Purpose / Big Picture

The ISBN auto-fill button on the book registration form (the "自動入力" button) fetches book metadata from the National Diet Library (NDL) OpenSearch API at `https://ndlsearch.ndl.go.jp/api/opensearch`. Browsers enforce the Same-Origin Policy: they will block any cross-origin request whose response does not carry permissive CORS headers. NDL does not send those headers, so the browser refuses the response before the JavaScript code ever sees it. The result is that clicking "自動入力" always fails with a CORS error, and the title/author fields are never populated.

After this change, the browser no longer makes a cross-origin request to NDL at all. Instead, it requests a same-origin path (`/ndl-proxy/...`) which is transparently forwarded to NDL by the server:

- In development (`npm start`, which runs `vite`): the Vite development server proxies the request.
- In E2E tests (`npm run test:e2e`, which builds and runs `vite preview`): the Vite preview server proxies the request.
- In production (Vercel): a rewrite rule in `vercel.json` proxies the request.

A human can verify the fix by opening the book registration form, typing a real ISBN such as `9784065362433`, clicking "自動入力", and observing that the title and author fields are populated without a CORS error in the browser console.


## Progress

- [x] Milestone 1 — Proxy configuration and hook URL change
- [x] Milestone 2 — Update unit tests
- [x] Milestone 3 — Update README.md


## Surprises & Discoveries

(None yet.)


## Decision Log

- Decision: Use `/ndl-proxy` as the path prefix for the proxy.
  Rationale: Short, clearly names the intent, unlikely to conflict with any existing route in the SPA.
  Date/Author: 2026-04-16

- Decision: Add both `server.proxy` and `preview.proxy` in `vite.config.ts`.
  Rationale: The Playwright E2E suite runs `npm run build && npm run preview` (see `playwright.config.ts` `webServer.command`). The `preview` server does not inherit `server.proxy`, so it needs its own entry.
  Date/Author: 2026-04-16

- Decision: Add a proxy entry to `vercel.json` rather than routing through `bookshelf-api`.
  Rationale: The frontend is a static SPA already deployed on Vercel; adding a rewrite in `vercel.json` requires no changes to the separate backend repository.
  Date/Author: 2026-04-16

- Decision: Add a "NDL Proxy" section to `README.md`.
  Rationale: The proxy configuration is non-obvious. A future contributor who sees `/ndl-proxy` paths in the code needs to understand why they exist and what sets them up.
  Date/Author: 2026-04-16


## Outcomes & Retrospective

Completed 2026-04-16. All three milestones landed in a single commit (`1850a15`). The only surprise was a Biome formatter failure: the plan used single quotes and a multi-line `fetch(...)` call, but the project enforces double quotes and Biome collapsed the short call to one line. Fixed before committing.


## Context and Orientation

This repository is a React + TypeScript single-page application (SPA) built with Vite. It has no server of its own; it communicates with a separate GraphQL backend (`bookshelf-api`). It is deployed to Vercel as a static site.

Key files relevant to this plan:

- `src/features/books/useIsbnLookup.ts` — React hook that fetches book metadata from NDL (primary) and Google Books (fallback). This is where the browser-side `fetch` calls live.
- `src/features/books/useIsbnLookup.test.ts` — Vitest unit tests for the hook. Tests stub `globalThis.fetch` with `vi.stubGlobal`, so they are unaffected by real network restrictions, but the asserted URL must match what the hook actually calls.
- `vite.config.ts` — Vite configuration file at the repository root. Controls the dev server (`server.*`) and the preview server (`preview.*`). Both support a `proxy` option that rewrites outbound requests before they leave the server.
- `vercel.json` — Vercel deployment configuration at the repository root. Currently contains one rewrite rule that redirects all paths to `index.html` (the standard SPA catch-all). Vercel processes rewrite rules in array order, so more-specific rules must appear before the catch-all.
- `playwright.config.ts` — Playwright configuration. The `webServer.command` is `npm run build && npm run preview`, confirming that E2E tests run against the preview server on port 4173.
- `README.md` — Project documentation. The "How to run locally" section describes the development workflow.

"Proxy" in this context means: the Vite (or Vercel) server intercepts a request from the browser to `/ndl-proxy/...`, strips the `/ndl-proxy` prefix, and forwards the request to `https://ndlsearch.ndl.go.jp/...`. From the browser's perspective the request is same-origin, so no CORS policy applies.


## Plan of Work

### Milestone 1 — Proxy configuration and hook URL change

Edit `vite.config.ts` to add a proxy entry under both `server` and `preview`. The existing `server` block only sets `port: 3000`; add a `proxy` key alongside it. The existing `preview` block only sets `port: 4173`; add a `proxy` key alongside it. Both proxy blocks are identical:

    '/ndl-proxy': {
      target: 'https://ndlsearch.ndl.go.jp',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/ndl-proxy/, ''),
    }

The `changeOrigin: true` option makes Vite set the `Host` header to `ndlsearch.ndl.go.jp` in the forwarded request, which is required for the NDL server to respond correctly.

Edit `vercel.json` to prepend a new rewrite rule before the existing catch-all. The file currently contains:

    {
      "rewrites": [{ "source": "/:path*", "destination": "/index.html" }]
    }

Change it to:

    {
      "rewrites": [
        {
          "source": "/ndl-proxy/:path*",
          "destination": "https://ndlsearch.ndl.go.jp/:path*"
        },
        { "source": "/:path*", "destination": "/index.html" }
      ]
    }

The new rule must come first. If it were placed after the catch-all, Vercel would match every `/ndl-proxy/...` request against the catch-all and serve `index.html` instead of proxying.

Edit `src/features/books/useIsbnLookup.ts`. In the `tryNdl` function (around line 29), change the fetch URL from the absolute NDL URL to the relative proxy path:

    // Before
    `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn}`

    // After
    `/ndl-proxy/api/opensearch?isbn=${isbn}`

No other changes are needed in this file. The Google Books URL in `tryGoogleBooks` remains absolute because Google Books supports CORS and the browser can call it directly.

### Milestone 2 — Update unit tests

Edit `src/features/books/useIsbnLookup.test.ts`. The test named "calls NDL URL with normalized ISBN" (around line 55) asserts the exact URL passed to `fetch`. Update the expected value to match the new relative path:

    // Before
    "https://ndlsearch.ndl.go.jp/api/opensearch?isbn=9784065362433"

    // After
    "/ndl-proxy/api/opensearch?isbn=9784065362433"

No other test assertions reference the NDL URL. The Google Books URL assertion (in the test "falls back to Google Books when NDL returns no items") remains unchanged.

### Milestone 3 — Update README.md

Add a new top-level section "NDL Proxy" to `README.md` after the existing "E2E Testing" section. The section should explain:

- Why the proxy exists (NDL does not send CORS headers; without a proxy the browser blocks the request).
- Where each environment sets up the proxy: Vite dev server and preview server (`vite.config.ts`), Vercel production deployment (`vercel.json`).
- That the hook calls `/ndl-proxy/api/opensearch?isbn=...`, which each environment forwards to `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=...`.


## Concrete Steps

All commands are run from the repository root (`/home/hiterm/ghq/github.com/hiterm/bookshelf`).

Step 1 — Edit `vite.config.ts`. The resulting `server` and `preview` blocks should look like this:

    server: {
      port: 3000,
      proxy: {
        '/ndl-proxy': {
          target: 'https://ndlsearch.ndl.go.jp',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ndl-proxy/, ''),
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/ndl-proxy': {
          target: 'https://ndlsearch.ndl.go.jp',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ndl-proxy/, ''),
        },
      },
    },

Step 2 — Edit `vercel.json` to the content shown in the Plan of Work section above.

Step 3 — Edit `src/features/books/useIsbnLookup.ts` line 30: change the fetch URL to `/ndl-proxy/api/opensearch?isbn=${isbn}`.

Step 4 — Edit `src/features/books/useIsbnLookup.test.ts`: update the expected URL string in the "calls NDL URL with normalized ISBN" test.

Step 5 — Edit `README.md`: add the NDL Proxy section.

Step 6 — Run the pre-commit checklist:

    npm run generate
    npm run test
    npm run typecheck
    npm run lint

All four commands must exit with code 0 before committing.

Step 7 — Commit. Follow the 50/72 rule and present-tense English. A suitable title: `Proxy NDL API requests to fix CORS error`. No body is required.


## Validation and Acceptance

Unit tests: run `npm run test`. The suite must pass. The test "calls NDL URL with normalized ISBN" must assert the new relative URL `/ndl-proxy/api/opensearch?isbn=9784065362433` and pass.

Manual verification in dev: run `npm start`, navigate to the book registration page, type ISBN `9784065362433` in the ISBN field, and click "自動入力". The title field should populate with the book title and the author field should populate with the author. The browser console must show no CORS errors.

E2E tests are not expected to cover the ISBN auto-fill interaction (the existing E2E tests only fill in the ISBN text field manually and do not click the auto-fill button). If E2E tests are run (`npm run test:e2e`), they should continue to pass without regression.


## Idempotence and Recovery

All edits are additive changes to existing files. If something goes wrong mid-way, `git diff` will show the partial state and `git restore <file>` can reset any individual file to the last committed state. Running `npm run test` after each file edit confirms no regression was introduced.


## Artifacts and Notes

The current content of `vercel.json` before this change:

    {
      "rewrites": [{ "source": "/:path*", "destination": "/index.html" }]
    }

The relevant portion of `playwright.config.ts` (confirms E2E uses preview server):

    webServer: {
      command: "npm run build && npm run preview",
      url: "http://localhost:4173",
      ...
    }

The current NDL fetch call in `useIsbnLookup.ts` (line 29–31):

    const response = await fetch(
      `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn}`,
    );

The current URL assertion in the unit test (line 67–69):

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ndlsearch.ndl.go.jp/api/opensearch?isbn=9784065362433",
    );


## Interfaces and Dependencies

No new npm packages are required. Vite's built-in proxy support (`server.proxy` and `preview.proxy`) uses the `http-proxy` library, which is already included as a Vite dependency. The proxy option type is `Record<string, string | ProxyOptions>` as exported from `vite`. The `rewrite` field within `ProxyOptions` is `(path: string) => string`.

Vercel's `rewrites` feature supports forwarding to external URLs by setting `destination` to a full `https://` URL; this is a documented Vercel platform capability and requires no additional configuration.
