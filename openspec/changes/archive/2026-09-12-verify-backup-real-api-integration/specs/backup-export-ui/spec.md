## MODIFIED Requirements

### Requirement: Users can download snapshot and full backups
The frontend SHALL issue authenticated GET requests to `/backup/snapshot` and
`/backup/full`, treat successful responses as Blobs, and trigger downloads using
a safe backend `Content-Disposition` filename when available. The backend SHALL
expose that response header cross-origin with
`Access-Control-Expose-Headers: Content-Disposition`. The real-backend
integration suite SHALL verify both download paths, filenames, and their minimum
versioned JSON response contract using data created through normal frontend
writes.

#### Scenario: Export either backup
- **WHEN** the user activates an export action
- **THEN** the corresponding authenticated endpoint response is downloaded

#### Scenario: Use the response filename
- **WHEN** a valid attachment filename is supplied
- **THEN** the browser download uses that filename

#### Scenario: Download from the real backend
- **WHEN** an integration-test user creates library data and exports snapshot
  and full backups
- **THEN** both real backend responses download with their scoped filenames and
  minimum version 1 JSON structures
