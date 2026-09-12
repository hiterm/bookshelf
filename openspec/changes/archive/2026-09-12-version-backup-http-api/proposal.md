## Why

Backup downloads should consume the versioned non-GraphQL API while the
frontend, not an HTTP response header, owns the browser filename.

## What Changes

- **BREAKING** call `/v1/backup/snapshot` and `/v1/backup/full`.
- Generate deterministic, filesystem-safe filenames in the frontend.
- Remove all `Content-Disposition` parsing and CORS expose-header expectations.
- Keep backup bodies opaque to the download implementation and retain real-backend coverage.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `backup-export-ui`: Uses the versioned JSON API and frontend-owned filenames.

## Impact

Backup download logic, unit tests, mock E2E, integration E2E, and PR documentation change.
