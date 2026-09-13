# Fix demo backup downloads

## Why

Demo-mode backup requests currently fall through to the static host and save
the SPA HTML fallback with a `.json` filename. Demo exports must use the same
versioned backup format as the real backend, and successful non-JSON responses
must not be downloaded.

## What Changes

- handle snapshot and full backup requests in the demo-mode service worker
- project the existing demo library and history into the backup v1 contract
- reject successful responses whose media type is not JSON-compatible
- cover both demo downloads by parsing and validating the downloaded files

## Impact

This changes only the frontend demo API and frontend response validation. The
real backend endpoints and backup v1 schema remain unchanged.
