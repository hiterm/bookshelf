## Why

After switching the frontend Vitest suite to `vmThreads`, CI runtime dropped
from 39.41 seconds to 16.72 seconds. `BookList.test.tsx` still takes 14.42
seconds by itself because 32 tests across filters, sorting, pagination, and
preset/reset behavior are grouped into one test file, which prevents Vitest's
file-level parallelism from distributing those groups across workers.

## What Changes

- Split the BookList test suite along its existing behavior groups into
  separate test files.
- Extract shared BookList test setup, fixtures, mocks, and render helpers into a
  non-test support module.
- Preserve the existing assertions and coverage while allowing Vitest to run
  the groups in parallel.
- Compare the resulting CI Vitest runtime with the current 16.72-second
  baseline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Specify that independently runnable large test
  groups should be partitioned into separate files when this improves
  file-level parallelism without weakening isolation.

## Impact

Only frontend test organization changes. Application runtime behavior, public
APIs, and production bundles are unchanged.
