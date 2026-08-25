## Context

The current frontend reads a Kindle Bookshelf Exporter file inside a modal,
parses its authors directly into arrays, builds fixed Kindle-flavored
`ImportBookInput` values, previews them, and then imports the retained preview
inputs. The mutation contract is already safe and sufficient, but parser,
conversion, modal lifecycle, filtering, and selection concerns are coupled.

The generated frontend schema and current `bookshelf-api` schema confirm that
the feature can become a route-level workspace without changing the backend
contract. It must remain usable for long Kindle exports, retain asynchronous
file read stale-result protection, and continue reporting mutation errors
through `AppErrorProvider`.

## Goals / Non-Goals

**Goals:**

- Route all source strings through one Kindle parser while preserving raw
  author text.
- Construct GraphQL input only at the preview boundary from explicit common
  and per-book settings.
- Keep selection independent of display filtering and keep successful preview
  inputs immutable until the next successful preview or invalidation.
- Provide a responsive route-level edit/preview experience with testable,
  focused components.
- Confirm the unchanged generated GraphQL contract through tests and CI.

**Non-Goals:**

- CSV, arbitrary JSON or field mapping, author-name editing, per-book common
  attributes, saved presets, or changes to `ImportBookInput`.
- Generalizing the source parser beyond Kindle Bookshelf Exporter JSON.
- Running the real-backend integration suite locally unless debugging requires
  it.

## Decisions

1. **Model source data independently from import choices.**
   `ImportedBook` stores `authorText`; a keyed per-book setting stores
   `splitAuthorsByComma`. A pure conversion helper trims and removes empty comma
   segments only when enabled. This keeps source parsing lossless and avoids
   treating names such as `Smith, John` as two authors by default. Parsing
   directly into author arrays was rejected because it cannot support a
   reversible per-row choice.

2. **Centralize Kindle-compatible defaults but expose typed settings.**
   One exported default object supplies `KINDLE`, `E_BOOK`, `true`, and `50`.
   Store and format use generated GraphQL enum types, and Mantine controls keep
   owned and priority typed. ISBN remains an implementation constant because no
   source value or UI mapping is in scope.

3. **Use route-local state and explicit edit/preview steps.**
   `/books/import` owns source, candidates, filters, selection, per-book
   settings, common settings, preview response, and retained inputs. The URL
   stays stable between steps. A route was chosen over query-driven or nested
   preview routing because preview is transient mutation state and should not
   imply a bookmarkable server resource.

4. **Treat visibility and selection as orthogonal sets.**
   Date filtering derives visible candidates without deleting source rows or
   changing selected IDs. Bulk controls affect only visible IDs and are labeled
   accordingly. Preview imports every selected candidate, including candidates
   currently hidden by a display-only filter. This replaces the current
   visible-and-selected intersection behavior.

5. **Retain successful-preview inputs as the import authority.**
   The preview handler creates `ImportBookInput[]` once, sends it, and stores the
   same array only after success. Import reads that retained array and never
   rebuilds from edit state. All input-affecting mutations invalidate preview;
   changing a display-only filter does not unless an explicit selection action
   changes selected IDs.

6. **Split UI by responsibility.**
   Source controls, common settings/action summary, candidate table, and preview
   presentation become focused components. The edit page uses a responsive grid
   with a sticky settings/action panel at desktop widths and a single column at
   narrow widths. This avoids replacing one oversized dialog component with one
   oversized page component.

7. **Share source loading while preserving stale-file protection.**
   File and textarea loading both pass a string to the same parse-and-install
   function. Switching source tabs does not install or clear candidate data;
   only an explicit load does. File reads retain a monotonically increasing
   request token so late results cannot replace a newer selection or text load.

8. **Derive preview summaries from backend results.**
   Existing/new author counts and row labels use `previewBookImport` response
   fields. The frontend does not duplicate backend author-resolution logic.

## Risks / Trade-offs

- **[Route state is lost on refresh]** → This is acceptable because settings
  persistence is out of scope; direct route access still renders a fresh editor.
- **[Large candidate lists remain DOM-heavy]** → The two-column/sticky layout and
  compact responsive rows reduce navigation cost; virtualization is deferred.
- **[Raw author text can be empty or split to no names]** → Parser/conversion
  validation rejects inputs that cannot produce at least one author.
- **[Generated enum control labels may expose backend naming]** → Reuse existing
  display conventions while values remain generated enum members.
- **[Async mutation completion after navigation]** → Disable conflicting actions
  while pending and navigate only after a confirmed successful import.

## Migration Plan

1. Add pure models/converters and tests while keeping the current mutation
   contract.
2. Add the `/books/import` route and route-level components.
3. Change the books-page import action to navigation and remove modal-only code.
4. Update component, router, mock E2E, and integration coverage; regenerate the
   route tree and GraphQL/MSW artifacts.
5. Roll back by reverting the frontend commits; no backend or persisted-data
   migration is required.

## Open Questions

None. The existing API contract was confirmed and SegmentedControl was selected
for the compact two-method source switch.
