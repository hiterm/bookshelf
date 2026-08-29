## Context

`BookImportPage` currently derives `visibleBooks` from the inclusive purchase-date
filter but derives Preview inputs and counts from all selected indexes. Selection
state deliberately survives filtering, so changing the filter can leave hidden
books selected and unintentionally eligible for import.

## Goals / Non-Goals

**Goals:**

- Apply the purchase-date scope consistently to displayed target counts, Preview
  enablement, Preview inputs, and the retained inputs later passed to Import.
- Preserve per-candidate selection while the date range narrows and restore its
  effect when the range widens.
- Invalidate retained Preview state whenever the date scope changes.

**Non-Goals:**

- Changing backend import APIs or validation.
- Removing hidden indexes from selection state.
- Changing the inclusive purchase-date filtering helper.

## Decisions

- Derive `importTargets` from `visibleBooks` filtered by `selectedIndexes`. This
  makes the safe sendable set explicit and reuses the existing inclusive date
  semantics. Deriving it from all indexed books and repeating the date predicate
  was rejected because it would duplicate filtering behavior.
- Keep `selectedIndexes` independent from visibility. Clearing hidden indexes was
  rejected because widening the date range would discard the user's individual
  choices.
- Build Preview inputs only from `importTargets`, retain that exact array after a
  successful Preview, and keep Import dependent solely on the retained array.
- Invalidate Preview on every date-filter change. Even when two filters happen to
  produce the same set, invalidating is a simple conservative rule that prevents
  importing inputs authorized under stale UI state.
- Keep visible bulk selection based on `visibleBooks`, preserving its current
  scope while target counts use `importTargets.length`.

## Risks / Trade-offs

- [A date edit that leaves targets unchanged still invalidates Preview] → Prefer a
  predictable safety invariant over comparing reconstructed input arrays.
- [Retained hidden selections can surprise users when widening the range] → Show
  the effective target count and restore only choices the user previously made.

