## Context

`test-integration-api-main` currently checks out `hiterm/bookshelf-api/main`,
reads its Rust toolchain, restores a Rust cache, and runs a local release build.
The API repository's rolling GHCR image provides the same compatibility target
as a reusable production container.

## Goals / Non-Goals

**Goals:**

- Remove API source compilation and Rust setup from frontend CI.
- Test the frontend revision against the latest available API `main` image.
- Make the exact pulled image digest visible in CI logs.
- Retain PostgreSQL, JWKS, API readiness, Playwright, and frontend setup.

**Non-Goals:**

- Change the pinned-release `test-integration` job.
- Treat the rolling image as a verified release.
- Run the frontend integration suite locally.

## Decisions

1. Explicitly run `docker pull ghcr.io/hiterm/bookshelf-api:main` before
   starting the API. This ensures CI does not accidentally use a stale local
   image.
2. Read the pulled image's repo digest with `docker image inspect` and print it
   as `Using bookshelf-api main image: ...` before startup for failure
   traceability.
3. Start the container with host networking and the same database, port,
   origins, audience, issuer, and JWKS values used by the source-built process.
4. Keep the `/health` loop as a readiness gate for integration tests, not as a
   release-quality guarantee.

## Risks / Trade-offs

- [The mutable tag can advance independently of the frontend revision] → Log
  the immutable pulled digest so a failing run identifies its actual API input.
- [The latest API main image may contain intentionally failing non-Docker CI]
  → This is expected; the job measures cross-repository compatibility with API
  `main`, not release readiness.
