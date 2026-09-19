## Why

The frontend compatibility job spends about a minute setting up Rust and
release-building the API from source. The API now publishes its current `main`
HEAD as a production GHCR image, so the frontend can consume that artifact
directly and shorten feedback time.

## What Changes

- Replace the API source checkout, Rust setup, cache restore, and release build
  in `test-integration-api-main` with an explicit pull of the API `:main` image.
- Log the pulled image digest and start it with the existing integration
  environment and readiness check.
- Preserve the fixed-release `test-integration` job unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Defines the rolling API `main` image as the compatibility
  target for `test-integration-api-main`.

## Impact

The change affects only `.github/workflows/ci.yml` and frontend CI duration. It
does not change frontend application behavior, dependencies, or the fixed API
release integration job.
