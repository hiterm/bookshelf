## ADDED Requirements

### Requirement: Shared test concurrency represents CI

The frontend SHALL use Vitest's default file parallelism in shared
configuration, and constraints that occur only in a local, sandbox, or agent
environment SHALL use environment-local overrides unless reproduced in CI or
another representative environment.

#### Scenario: CI runs the frontend test suite

- **WHEN** the shared Vitest configuration is used in CI
- **THEN** Vitest executes test files with its default file-parallel behavior

#### Scenario: A constrained local environment requires serialization

- **WHEN** test-file parallelism causes resource starvation only in a local,
  sandbox, or agent environment
- **THEN** that environment uses a local override without changing shared test
  concurrency, worker counts, or timeouts
