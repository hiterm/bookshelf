## Why

The book list displays author readings in a dedicated column, but users cannot
filter the list by that value. Adding a reading filter makes it easier to find
books when an author's written name is unknown or ambiguous.

## What Changes

- Add a text filter to the author reading column in the book list.
- Match books when any associated author's reading contains the entered text.
- Persist the reading filter in the book list URL search state like existing
  column filters.

## Capabilities

### New Capabilities

- `book-reading-filter`: Filter the book list by partial author reading text.

### Modified Capabilities

None.

## Impact

- Book list column configuration and client-side filtering.
- Book list URL search validation.
- Book list component tests.
