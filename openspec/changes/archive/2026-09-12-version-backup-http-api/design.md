## Context

The frontend currently derives download names from a cross-origin response header. The API is moving to versioned JSON routes without attachment semantics.

## Goals / Non-Goals

**Goals:** consume `/v1`, keep the response as an opaque Blob, and generate safe deterministic filenames locally.

**Non-Goals:** parsing backup JSON for filenames or changing the backup schema and UI workflow.

## Decisions

- Generate `bookshelf-backup-{scope}-YYYY-MM-DDTHHMMSSZ.json` from a supplied `Date`.
- Ignore response headers and preserve token, HTTPS, error, Blob, and object-URL behavior.
- Cover the boundary in both mock and real-backend E2E suites.

## Risks / Trade-offs

- Frontend and backend deployments must be coordinated → link the follow-up backend PR and do not hide pre-merge CI failure.
