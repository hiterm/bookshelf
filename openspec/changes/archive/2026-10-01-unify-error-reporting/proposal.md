## Why

Author and user registration failures bypass persistent error reporting. Several query screens serialize raw errors or log them, bypassing the existing safe normalization and potentially exposing GraphQL request data.

## What Changes

- Report author and user registration failures through the existing application error operation, once per failed attempt.
- Render local query errors through a shared component using safe normalization.
- Remove raw query error logging and preserve validation, retry, and successful operation behavior.
- Add regression tests for reporting, retry, and sensitive data exclusion.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `persistent-error-reporting`: Explicitly require safe local query messages and define the caller's responsibility for mutation reporting.

## Impact

Error components, registration UI, book and author query screens, and mock API E2E tests. No API contract or dependency changes. Scope is item 1 of issue #406.
