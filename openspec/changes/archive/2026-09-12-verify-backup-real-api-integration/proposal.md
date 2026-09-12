## Why

The existing mocked backup E2E coverage verifies frontend download and error
handling, but it cannot detect drift in the untyped REST contract between the
frontend and `bookshelf-api`. The real-backend integration suite should verify
that both backup endpoints work through authentication, CORS, response headers,
and browser download handling.

## What Changes

- Add real-backend Playwright integration coverage for snapshot downloads.
- Add real-backend Playwright integration coverage for full downloads with
  history created through normal UI writes.
- Keep detailed backup schema and history edge cases in the backend test suite,
  and keep frontend-only failure behavior in the mocked E2E suite.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `backup-export-ui`: Require the real-backend integration suite to verify the
  minimum cross-origin HTTP download contract for both backup scopes.

## Impact

- Adds an `e2e-integration` Playwright specification.
- Makes frontend PR integration CI intentionally depend on a backend `main`
  revision that exposes `/backup/snapshot` and `/backup/full`.
- Does not change production frontend code or the backend API contract.
