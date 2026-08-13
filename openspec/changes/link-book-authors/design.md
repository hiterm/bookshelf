## Context

`BookDetailShow` currently joins author names into one text value. The application already exposes a typed Mantine/TanStack Router `Link` and an `/authors/$id` detail route, while each book author already includes the required `id`.

## Goals / Non-Goals

**Goals:**

- Make each author name independently navigable from a book detail page.
- Retain the existing visual ordering and comma-separated presentation.
- Cover link destinations at component level and the user flow at E2E level.

**Non-Goals:**

- Changing author or book data models, GraphQL operations, or routes.
- Linking author readings or author names shown outside the book detail page.

## Decisions

- Use the existing `Link` wrapper from `compoments/mantineTsr`, targeting `/authors/$id` with each author's ID. This preserves typed routing, Mantine styling, and intent preloading consistently with the author list.
- Render separators as text between links rather than joining names into one string. This keeps the current comma-and-space appearance while giving every author its own accessible link.
- Extend `BookDetailShow`'s component test to assert link names and destinations, and add a mock-API E2E navigation test because the change is a critical cross-screen interaction.

## Risks / Trade-offs

- [The component test currently mocks only `LinkButton`] → Extend the module mock with a lightweight anchor implementation of `Link` that exposes the generated author URL.
- [Multiple links and separators could change wrapping] → Keep all nodes in the existing `Group`, allowing its current layout behavior to handle wrapping.
