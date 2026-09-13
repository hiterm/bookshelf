## Context

The backend provides authenticated `GET /backup/snapshot` and
`GET /backup/full` JSON attachments. The frontend centralizes token acquisition
and persistent errors, and uses file-based TanStack Router code splitting. The
implementation starts from frontend `67a1c979f4a377d2e8cdd7c40f2540727a026778`
and backend `1ecd4a139b7956238a87dc3274b52a1e891131f6`.

## Goals / Non-Goals

**Goals:** make export discoverable, authenticate downloads, respect safe server
filenames, prevent repeat requests, surface errors, and preserve route splitting.

**Non-Goals:** import, restore, `/settings` index, submenu, preview, validation,
scheduling, storage, encryption, or compression.

## Decisions

1. `設定` links directly to `/settings/backup`.
2. An HTTP helper reuses API URL and token acquisition, requests a Blob, parses
   a safe `Content-Disposition` filename, and triggers a temporary object URL.
3. Each action owns pending state. Non-success responses use persistent error
   reporting and are never saved.
4. The route exports only its definition; its component lives outside the route
   file to preserve automatic code splitting.

## Risks / Trade-offs

- **[Filename is absent or malformed]** -> Use a deterministic safe fallback.
- **[Object URLs leak]** -> Revoke them after initiating download.
- **[Large files occupy memory]** -> Blob download matches the server contract.

## Migration Plan

Deploy after the backend endpoints are available.
