## MODIFIED Requirements

### Requirement: Users can download snapshot and full backups
Outside demo mode, the frontend SHALL issue authenticated GET requests to
`/v1/backup/snapshot` and `/v1/backup/full`, treat successful JSON-compatible
responses as opaque Blobs, generate a safe deterministic filename locally, and
trigger downloads through a Blob object URL without depending on
`Content-Disposition`. A successful response whose media type is not JSON
compatible SHALL fail without creating a download. The HTTP `/v1` version
namespace SHALL be treated independently of backup body format `version: 1`.
Demo mode SHALL serve `/api/v1/backup/snapshot` and `/api/v1/backup/full` from
its local mock API without requesting an Auth0 token, using the same backup v1
contract as the real backend. The real-backend integration suite SHALL verify
both download paths, generated filenames, and their minimum versioned JSON
response contract using data created through normal frontend writes.

#### Scenario: Export a demo snapshot backup
- **WHEN** a demo user exports a snapshot backup
- **THEN** the downloaded file parses as backup v1 JSON with current authors and books and without history

#### Scenario: Export a demo full backup
- **WHEN** a demo user exports a full backup
- **THEN** the downloaded file parses as backup v1 JSON with current data and history collections

#### Scenario: Successful response contains a non-JSON media type
- **WHEN** a backup endpoint returns a successful response with a non-JSON media type
- **THEN** no file is downloaded and the user sees an error
