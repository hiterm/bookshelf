## Why

The frontend unit-test job is now the CI critical path. On the latest main run,
Vitest took 39.41 seconds and reported that jsdom was created 41 times for
37.65 seconds of tracked environment time. Vitest recommends the `vmThreads`
pool for this pattern so workers can reuse the jsdom runtime while preserving
per-file isolation.

## What Changes

- Configure Vitest to use the `vmThreads` pool for unit and component tests.
- Keep the existing jsdom environment, setup file, and default file-level
  parallelism unchanged.
- Verify the full unit/component suite still passes and compare CI runtime.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Specify the worker pool used by the shared jsdom
  test configuration.

## Impact

Only the shared Vitest configuration changes. Application runtime behavior,
test assertions, and public APIs are unchanged.
