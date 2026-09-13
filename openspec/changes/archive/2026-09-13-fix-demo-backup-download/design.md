# Design: Demo backup responses

The demo service worker handles `GET /api/v1/backup/snapshot` and
`GET /api/v1/backup/full`. It reads the existing `MockStore` state and maps its
current entities, operations, changes, and revisions to the backend-owned
backup v1 JSON shapes. Snapshot data omits `history`; full data always includes
operations, book revisions, and author revisions.

The download client validates a successful response's media type before
creating a Blob URL. It accepts `application/json` and structured syntax suffix
types ending in `+json`, including parameters such as a charset. Other 2xx
responses fail through the existing persistent error-reporting path, preventing
SPA HTML fallback responses from being saved as JSON files.

Demo E2E tests exercise the service worker rather than Playwright route mocks,
read each downloaded file, parse it as JSON, and verify the minimum snapshot or
full backup contract.
