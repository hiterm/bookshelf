## Why

Users need a discoverable way to download portable snapshot and full backup
files provided by the backend.

## What Changes

- Add `/settings/backup` with snapshot and full export actions.
- Add a `設定` Navbar link directly to the backup page.
- Download authenticated HTTP responses using server filenames.
- Show independent pending states and existing-style errors.

## Capabilities

### New Capabilities

- `backup-export-ui`: Navigate to and download snapshot and full backups.

### Modified Capabilities

None.

## Impact

Adds a route, feature component, authenticated download helper, navigation
entry, and tests. It adds no GraphQL operations or import UI.
