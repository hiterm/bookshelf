## Why

`BooleanValue` returns a Mantine `ThemeIcon` whose default root is a `div`.
Rendering it inside Mantine `Text` therefore nests a `div` below the generated
`p`, producing invalid HTML and hydration errors.

## What Changes

- Make both the true and false variants of `BooleanValue` render their
  `ThemeIcon` with a `span` root.
- Preserve the component's appearance, colors, sizes, icons, and meaning.
- Add regression coverage proving both variants remain safe inside paragraph
  content.
- Keep all callers unchanged so inline safety is guaranteed by
  `BooleanValue` itself.

## Capabilities

### New Capabilities

- `boolean-value-inline-semantics`: Defines `BooleanValue` as an inline-safe
  presentational component usable in prose, table cells, and detail views.

### Modified Capabilities

None.

## Impact

- `src/components/utils/BooleanValue.tsx`
- A focused component regression test for `BooleanValue`
- Existing consumers including BookHistory, BookDetail, book table columns,
  and AuthorBookList remain unchanged.
- No API, dependency, visual, or behavioral changes are introduced.
