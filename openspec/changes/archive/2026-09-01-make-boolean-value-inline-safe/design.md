## Context

`BooleanValue` renders one of two Mantine `ThemeIcon` instances. Mantine uses a
`div` as the default `ThemeIcon` root, while existing consumers can place the
component inside `Text`, which renders paragraph content. This creates invalid
`p > div` markup and can cause hydration errors.

## Goals / Non-Goals

**Goals:**

- Give both boolean variants an inline-safe root element.
- Preserve the existing icons, colors, size, and meaning.
- Prevent regression with a test that exercises paragraph nesting.
- Keep prose, table-cell, and detail-view consumers valid without caller-side
  workarounds.

**Non-Goals:**

- Changing layouts in BookHistory, BookDetail, book table columns, or
  AuthorBookList.
- Changing `BooleanValue` styling or public props.
- Depending on Mantine's internal icon markup in tests.

## Decisions

- Set `component="span"` on both `ThemeIcon` branches. This uses Mantine's
  supported polymorphic root API and corrects semantics at the reusable
  component boundary. Changing individual callers to `div` or `Group` would
  leave other and future inline uses unsafe.
- Render each boolean variant inside a paragraph in the regression test and
  assert the `ThemeIcon` root is a `span`. This directly protects the intended
  semantic contract without asserting Lucide or Mantine internal descendants.
- Leave all existing consumers unchanged after checking that none requires a
  block-level root.

## Risks / Trade-offs

- [A caller may have relied on block-level layout behavior] → Search and review
  every `BooleanValue` usage; retain Mantine's existing size and styles, which
  continue to control the visual box.
- [A test selector could couple to framework internals] → Select the rendered
  root through a stable test container or semantic relationship and assert
  only its tag name.
