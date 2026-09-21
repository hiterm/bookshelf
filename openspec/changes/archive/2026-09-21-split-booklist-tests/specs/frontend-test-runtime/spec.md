## ADDED Requirements

### Requirement: Large independent suites expose file-level parallelism

The frontend SHALL partition large unit or component test suites into separate
test files when the groups are independently runnable and a single test file
materially dominates CI runtime. Shared fixtures and render helpers MAY be
extracted into non-test support modules, but file isolation and existing
behavior coverage SHALL be preserved.

#### Scenario: A single test file dominates unit-test runtime

- **WHEN** independently runnable behavior groups in one test file materially
  dominate the frontend Vitest runtime
- **THEN** the groups are split into separate test files so Vitest can schedule
  them with its existing file-level parallelism

#### Scenario: Split tests share setup

- **WHEN** the split test files require the same fixtures, mocks, or render
  helpers
- **THEN** shared support can be extracted without turning off file isolation or
  weakening the existing assertions
