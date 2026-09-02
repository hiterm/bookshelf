## Why

`pnpm test` reports a TanStack Router warning that route component exports will
not be code-split and will increase bundle size. The warning first identified
`HistoryIndexPage` in `src/routes/history/index.tsx`; reviewing the same pattern
also identified `HistoryDetailPage` in
`src/routes/history/$operationId.tsx`.

TanStack Router's [Automatic Code Splitting documentation](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
explains that exporting values used by code-splittable route properties, such
as `component`, from a route file prevents those values from being split. The
warning does not appear during `pnpm build`, so investigation must consider the
route-file structure and test output rather than treating build output alone as
evidence that code splitting is correct.

## What Changes

- Inspect every `src/routes/**/*.{ts,tsx}` route file for locally defined
  runtime values used by code-splittable route properties and exported from the
  same file.
- Stop exporting the confirmed `HistoryIndexPage` and `HistoryDetailPage`
  components from their route files, preserving direct test imports through a
  non-route file only if required.
- Confirm the TanStack Router code-splitting warning is absent from the focused
  history tests and the full unit test suite; use the build result only as a
  supplementary check.
- Add `docs/architecture/routing.md` with the durable route-file design
  convention and link architecture documentation from `AGENTS.md`.
- Do not add an ESLint rule or any dedicated continuous/static detection
  mechanism.

## Capabilities

### New Capabilities

- `route-file-code-splitting`: Route files preserve TanStack Router automatic
  code splitting by keeping code-splittable runtime values private or moving
  externally imported components to ignored non-route files.

### Modified Capabilities

None.

## Impact

- Frontend route files under `src/routes/`, especially the history list and
  detail routes.
- History route unit tests and TanStack Router warning output.
- Frontend architecture documentation in `docs/architecture/routing.md` and
  its contributor guidance in `AGENTS.md`.
- No `bookshelf-api` changes, API changes, dependency changes, or new static
  analysis rules.
