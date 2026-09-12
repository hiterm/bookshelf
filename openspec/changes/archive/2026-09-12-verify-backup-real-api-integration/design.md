## Context

Backup downloads use REST endpoints rather than the generated GraphQL client.
The mocked Playwright suite verifies frontend behavior, while the integration
suite already supplies a unique authenticated user and a real `bookshelf-api`.

## Goals / Non-Goals

**Goals:**

- Verify snapshot and full browser downloads against the real backend.
- Cover endpoint paths, authentication, CORS-exposed filename, and the minimum
  versioned JSON response contract.
- Create representative Books, Authors, Operations, and Revisions through the
  normal frontend UI.

**Non-Goals:**

- Duplicate the backend's exact-schema, ordering, tenant-isolation, baseline,
  undo, or corrupted-data tests.
- Replace existing mocked download and error-handling E2E coverage.
- Skip the test while backend `main` lacks the required endpoints.

## Decisions

- Add a dedicated `e2e-integration/backup.spec.ts` using the existing `page`
  fixture and login-registration flow. This keeps real-backend coverage in the
  suite configured for unique users and serial execution.
- Use normal Author and Book UI creation before downloading. This verifies the
  REST response contains data written through the generated GraphQL path without
  coupling the test to backend database setup.
- Parse the Playwright download artifact and assert only the boundary contract.
  Detailed backup format behavior remains owned by backend tests.

## Risks / Trade-offs

- Backend `main` does not expose the endpoints until PR #340 is merged, so the
  frontend integration job will intentionally fail before that dependency is
  satisfied.
- Download artifacts require filesystem access in Playwright CI; use
  `download.createReadStream()` to avoid assumptions about persistent paths.
