## Why

Book Import requires repetitive per-book author splitting and makes primary actions difficult to reach when importing long lists, especially after the responsive layout stacks settings below the list on mobile. The workflow should support bulk defaults with per-book exceptions while keeping preview and import actions reachable without long scrolling.

## What Changes

- Add bulk controls that enable or disable comma-based author splitting for only the currently visible books while preserving per-book overrides and hidden-book state.
- Add a compact mobile-only fixed preview action bar to the input step while retaining the desktop 8:4 layout and sticky settings panel.
- Add a compact fixed action bar to the preview step with back and count-aware import actions.
- Reserve bottom space, respect AppShell content offsets and mobile safe areas, and keep existing busy/loading behavior.
- Extend component and mock-API end-to-end coverage for bulk splitting and reachable mobile actions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `book-import`: Add visible-only bulk author splitting and responsive, scroll-independent primary actions for long input and preview lists.

## Impact

The change affects the Book Import page, table, settings and preview components under `src/features/books/import/`, adds a small Book Import action-bar component if useful, and updates Vitest and Playwright mock-API tests. GraphQL APIs and stored data formats do not change.
