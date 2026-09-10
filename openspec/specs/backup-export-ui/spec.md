# backup-export-ui Specification

## Purpose
TBD - created by archiving change add-backup-export. Update Purpose after archive.
## Requirements
### Requirement: Users can navigate to backup settings
The frontend SHALL expose `設定` linking directly to `/settings/backup`, whose
`バックアップ` page presents snapshot and full descriptions and actions.

#### Scenario: Open backup settings
- **WHEN** a user activates `設定`
- **THEN** both export choices appear without an import action

### Requirement: Users can download snapshot and full backups
The frontend SHALL issue authenticated GET requests to `/backup/snapshot` and
`/backup/full`, treat successful responses as Blobs, and trigger downloads using
a safe backend `Content-Disposition` filename when available. The backend SHALL
expose that response header cross-origin with
`Access-Control-Expose-Headers: Content-Disposition`.

#### Scenario: Export either backup
- **WHEN** the user activates an export action
- **THEN** the corresponding authenticated endpoint response is downloaded

#### Scenario: Use the response filename
- **WHEN** a valid attachment filename is supplied
- **THEN** the browser download uses that filename

### Requirement: Backup download state and errors are visible
Each action SHALL be disabled and loading while its request is pending, and
failed HTTP or network responses SHALL use existing persistent error reporting
without triggering a file download.

#### Scenario: Prevent duplicate submission
- **WHEN** a backup request is pending
- **THEN** its action cannot start a duplicate request

#### Scenario: Backend returns an error
- **WHEN** a backup response is unsuccessful
- **THEN** no file is downloaded and the user sees an error
