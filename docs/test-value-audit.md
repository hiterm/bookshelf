# Test value audit (2026-09-28)

Baseline: `3e3e186` on main. This is a responsibility and assertion audit of the
frontend test inventory, with deeper inspection of asynchronous hooks, import,
CRUD, backup, routing, error handling, mock stores, fixtures, and CI. It is not
a claim that every assertion was independently mutation-tested.

## Preserve the test boundaries

| Layer                   | Responsibility                                                                            | Assessment                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pure Vitest tests       | Parsing, conversion, URL validation, selection algorithms                                 | Small, deterministic cases have value even where UI tests exercise the same logic. Keep invalid input and date boundary cases.  |
| Component/hook Vitest   | UI state, validation, pending/error behavior, router search synchronization               | Highest-priority weakness is assertions before asynchronous completion. Mocked mutation hooks do not verify cache invalidation. |
| Mock API Playwright     | Built frontend, Auth0 flow, GraphQL schema/resolvers, navigation, controlled API failures | Keep navigation and persistence workflows. Remove same-suite smoke cases already fully asserted by longer workflows.            |
| Demo Playwright         | Service worker registration, handlers, demo store, browser downloads                      | Similar CRUD tests exercise a different runtime and must stay. New browser contexts isolate the service-worker singleton.       |
| Real-backend Playwright | Actual API contracts, revisions, import author resolution, backup envelope                | Keep both pinned and main API CI variants. Run only in CI for this change, as requested. Each page gets a distinct user.        |

## Implemented improvements

1. `useBookLookup.test.ts`: the old stale-response test started the first search
   with `void`, then waited for `success` that was already established by the
   second search. It did not await completion of the first search. Retain its
   promise and await it inside `act` before inspecting results. Cover stale
   success, stale failure, delayed OpenBD enrichment, and an empty-query reset
   followed by either completion outcome. An ISBN-free response avoids an
   unrelated enrichment failure masking an overwrite.
2. `BookImportPage.test.tsx`: replace optional resolver calls and an immediately
   true negative `waitFor` with controlled file promises settled inside async
   `act`. Check the newer row still exists after stale success and failure, and
   that stale errors are absent.
3. The hidden-selection component test previously checked only visible counts.
   Reveal rows after deselection and assert each checkbox. Then deselect the
   hidden row, filter again, select visible rows, and reveal both: this verifies
   preservation of both selected and unselected hidden state. Keep the pure
   helper test; it separately protects immutability.
4. `useDebouncedEffect.test.ts`: consolidate before/at-deadline checks into one
   lifecycle, check no repeat execution, and cover unmount cancellation. Keep
   dependency-change rescheduling.
5. Remove two mock API book smoke cases with exact assertion overlap:

   | Removed                                             | Retained assertion owner                                                                                |
   | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
   | `navigates to detail page when clicking book title` | `displays book information on detail page` clicks the same link and asserts the same URL before content |
   | `opens modal with Add button`                       | `creates a new book` opens and asserts the same named dialog before filling it                          |

No production behavior, dependencies, global test settings, or historical
artifacts are changed.

## Prioritized follow-ups

- **High: mutation cache integration.** Most component tests mock API hooks.
  Add tests around a real QueryClient and controlled SDK boundary for a mutation
  followed by cached list/detail/related-author views. Assert refreshed observable
  data, not a list of `invalidateQueries` calls. This would protect cross-screen
  stale data without repeating full CRUD suites.
- **Medium: mutation failure and retry.** Author delete cancellation currently
  verifies modal disappearance but not absence of a mutation. Extend it with a
  no-mutation assertion; add delete failure retaining the detail and allowing
  retry. Book import already covers preview/import errors, but controlled pending
  operations could verify duplicate-submit prevention and eventual recovery.
- **Medium: E2E assertion completeness.** `updates all fields` changes format,
  store, priority, and flags, but verifies mainly title/ISBN after saving. Verify
  persisted values by reopening the editor; rename the case if its scope stays
  narrower. Avoid assuming field interactions alone prove persistence.
- **Medium: shared browser shims.** Numerous component files repeat matchMedia,
  ResizeObserver, and scrollIntoView setup. An opt-in test utility could reduce
  maintenance, but must preserve tests' custom behavior and restore descriptors.
  Avoid automatically moving every stub into global setup.
- **Low: presentation smoke consolidation.** AuthorDetail/AuthorEdit have
  separate button-presence tests whose controls are also used by interaction
  tests. Consolidate only after mapping all unique assertions. Enum label tests
  are cheap and specify user-visible labels; deleting them adds little value.
- **Keep:** BookList's DOM plus URL assertions, timezone-independent date tests,
  error redaction/clipboard tests, and backup content-type/auth/download tests
  cover distinct failures. Do not replace these with snapshots or coverage-only
  assertions. DOM order tests do not replace Playwright mobile geometry tests.

## Validation

- Targeted tests: 3 files, 34 tests passed.
- Full Vitest: 41 files, 228 tests passed (`pnpm run test --maxWorkers=2`).
- Generation, lint, formatting, and all TypeScript projects passed.
- Mock API Playwright: 53 passed; demo Playwright: 17 passed (local `--workers=2`).
- Real-backend integration is delegated to CI.
- OpenSpec strict validation passed.

Temporary mutations were detected by the intended assertions:

| Mutation                                | Failing regression cases                    |
| --------------------------------------- | ------------------------------------------- |
| Remove lookup request guards            | Stale success, failure, and enrichment (3)  |
| Remove empty-query request invalidation | Pending success and failure after reset (2) |
| Remove file-read guards                 | Stale success and failure (2)               |
| Start bulk selection from an empty set  | Hidden selection preservation (1)           |
| Remove debounce timeout cancellation    | Unmount cancellation (1)                    |

Each experiment restored its production file in `finally`. Final production
sources match main. These targeted experiments demonstrate detection of these
specific regressions, not an exhaustive mutation score.
