## Why

After switching the frontend Vitest suite to `vmThreads`, CI runtime dropped
from 39.41 seconds to 16.72 seconds. `BookList.test.tsx` still takes 14.42
seconds by itself because 32 tests are grouped into one test file, which leaves
a long serial critical path.

## What Changes

- Split the BookList suite into two files: filters, and the remaining sorting,
  pagination, and preset/reset behavior.
- Extract shared BookList test setup, fixtures, mocks, and render helpers into a
  non-test support module.
- Preserve the existing assertions and coverage while exposing useful
  file-level parallelism without multiplying heavy jsdom/Mantine setup across
  too many files.
- Compare the resulting CI Vitest runtime with the current 16.72-second
  baseline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Specify that independently runnable large test
  groups may be partitioned into separate files when this improves
  representative CI runtime without weakening isolation.

## Impact

Only frontend test organization changes. Application runtime behavior, public
APIs, and production bundles are unchanged.
