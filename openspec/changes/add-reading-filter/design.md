## Context

The book list uses TanStack Table for client-side column filtering and stores
validated filter state in the route search parameters. The author reading
column is currently a display column, so it has neither an accessor value nor
a filter control.

## Goals / Non-Goals

**Goals:**

- Make the author reading column filterable with the existing text input.
- Match a book when the entered text occurs in at least one author's reading.
- Preserve and restore the filter through the route search state.

**Non-Goals:**

- Kana normalization or fuzzy matching.
- Backend filtering or pagination.
- Changes to author data entry.

## Decisions

- Use an accessor function that derives the displayed reading string from the
  book's authors. This gives the column a stable `authorYomis` value that the
  existing `includesString` filter can evaluate while preserving the current
  display format.
- Reuse `StringFilter` and the existing debounced URL synchronization behavior
  instead of introducing a reading-specific control.
- Extend the route search schema with `authorYomis` so bookmarked and
  browser-driven filter state remains validated.

## Risks / Trade-offs

- Partial matching is literal and does not normalize hiragana and katakana. →
  Keep behavior consistent with the existing string filters and cover it with
  component tests.
- Joining multiple readings into one display value could theoretically match
  across a separator. → The existing display helper supplies explicit
  separators, and ordinary reading queries do not span them.
