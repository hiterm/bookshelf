## Why

The bulk book import dialog currently previews only the Kindle JSON parsed by
the frontend, so users cannot verify the normalized books and authors that the
backend will actually import. The backend now provides `previewBookImport`,
which runs the import path without persisting its changes and can provide an
advisory confirmation step before import.

## What Changes

- Add a required backend preview step between candidate selection and import.
- Display normalized preview books and each author's existing/new resolution.
- Enable import only after preview succeeds, using the exact
  `ImportBookInput[]` captured for that preview.
- Invalidate the preview whenever file, purchase-date, or selection inputs
  change, while retaining editable input after preview or import failures.
- Add GraphQL client, mock API, component, and E2E coverage for the two-stage
  flow.
- Keep preview advisory: importing reruns backend processing and may differ if
  database state changes between requests.

## Capabilities

### New Capabilities

- `book-import`: Defines candidate selection, backend preview, preview
  invalidation, and import behavior for bulk book imports.

### Modified Capabilities

None.

## Impact

- Updates the pinned backend schema from `2.13.0` to the `2.14.0` contract and
  adds a `previewBookImport` GraphQL operation and authenticated mutation hook.
- Changes the bulk import dialog state, actions, error reporting, and display.
- Extends generated GraphQL artifacts and preview support in mock
  infrastructure.
- Updates Vitest component tests and relevant Playwright mock/integration
  flows. The backend API contract itself is unchanged.
