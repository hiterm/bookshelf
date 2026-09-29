# Priority regression tests (2026-09-29)

Follow-up to [Issue #401](https://github.com/hiterm/bookshelf/issues/401),
started from latest main `8250247`. PR #395's completed-async assertions and
cache follow-up guide the tests; PR #399's isolation and shared runtime
configuration remain intact. Historical reports are unchanged.

## Contracts and boundaries

| Tests                                   | Protected contract                                                                                                                                                                                   | Boundary controlled                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `mutationCache.test.tsx`                | Author merge refreshes active lists, both author details, related books, and revisions. Failed book update retains old data; retry refreshes books, old/new author associations, and book revisions. | SDK methods, with generated SDK types; real QueryClient and hooks                  |
| `useOpenBdDetail.test.ts`               | Description priority/fallback, valid page counts, optional/empty data, HTTP/network/JSON/shape error recovery, and completed stale success/error after supersession or reset                         | Fetch responses and deferred promises                                              |
| `BookSearchResultPreviewModal.test.tsx` | Detail failure still permits selection of the original result; close clears old details                                                                                                              | Fetch; real detail hook and modal                                                  |
| `BookCreateForm.test.tsx`               | Autofill normalizes case/whitespace, reuses existing IDs, removes blanks/duplicates, and leaves only unknown authors pending                                                                         | Directory and lookup hooks; actual form submission                                 |
| `AddBookButton.test.tsx`                | Author failure prevents book creation; book failure retains resolved authors and input for retry; the entire registration rejects duplicate submissions                                              | Typed SDK, lookup results, error/notification sinks; real forms and mutation hooks |

Cache tests keep every observer mounted with infinite stale time and automatic
mount/focus/reconnect refresh disabled. Immutable server snapshots prevent
accidental cache mutation from simulating refetch. Assertions inspect resulting
data rather than invalidation call arrays. They complement browser navigation
tests, which can incidentally refresh stale data on remount.

Deferred detail requests are settled and their hook promises awaited inside
`act`. Registration failures wait for the error reporter after rejection;
success waits for dialog closure. Tests do not rely on arbitrary sleeps or
immediately true negative assertions before the controlled work finishes.

## Reproduced defects and corrections

- Book update left old author-detail book associations and book revisions in
  cache. Invalidate author details (both previous and new associations) and the
  updated book's revisions. An active-consumer regression fails without these
  invalidations.
- During author creation the submit button remained enabled and a repeated
  form submission caused two book-creation calls. Guard the entire author/book
  sequence synchronously and keep the button pending until it settles. Release
  the guard in `finally` so both author and book failures allow retry.

Partial success among several concurrently created authors remains a separate
recovery policy. These tests cover one pending author and reuse after successful
author resolution followed by book failure; they do not claim multi-author
transaction rollback or idempotency.

## Test sensitivity experiments

Temporary edits were restored in `finally`; no mutation runner is added to CI.

| Temporarily removed behavior                   | Detected regression cases                                  |
| ---------------------------------------------- | ---------------------------------------------------------- |
| Merge invalidation of book details             | Active merged book still contains source author (1)        |
| Book-update revision invalidation              | History lacks the new revision (1)                         |
| OpenBD stale-request guards                    | Superseded/reset success and all tested failure exits (12) |
| Reset invalidation of a pending OpenBD request | Idle overwritten by old completion (6)                     |
| Registration handler guard                     | Repeated form submission creates duplicate books (1)       |

These experiments establish sensitivity to these specific regressions, not an
exhaustive mutation score or performance comparison.

## Validation

- Focused Vitest: 5 files / 43 tests passed, including 39 added tests.
- Lint, formatting, and all TypeScript projects passed for the implementation.
- Full Vitest: 45 files / 267 tests passed (`pnpm run test`).
- Mock API E2E: 53 passed; Demo E2E: 17 passed (local `--workers=2`).
- Generation and OpenSpec strict validation passed.
- Real-backend integration is delegated to both existing CI variants.
- No dependency, coverage exclusion, worker count, timeout, or isolation changes.
