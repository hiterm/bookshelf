# frontend-test-runtime Specification

## Purpose

Define the supported frontend unit-test runtime and shared DOM matcher setup.

## Requirements

### Requirement: Rstest is the supported unit-test runtime

The frontend SHALL use Rstest 0.12.0 for unit and component tests, with package
metadata and the lockfile resolving consistently.

#### Scenario: Install test dependencies from the lockfile

- **WHEN** contributors install dependencies with the frozen lockfile
- **THEN** pnpm installs the declared Rstest version without dependency-resolution changes

### Requirement: DOM matchers use the Rstest integration

The shared setup file SHALL register `@testing-library/jest-dom/matchers` with
Rstest through `expect.extend`. TypeScript SHALL include `@rstest/core/globals`
and `@testing-library/jest-dom` so test assertions recognize DOM matchers
without handwritten matcher declarations.

#### Scenario: Type-check a component matcher assertion

- **WHEN** a component test uses a jest-dom matcher through Rstest `expect`
- **THEN** TypeScript accepts the matcher and Rstest executes it at runtime

### Requirement: Migration preserves test behavior

The Rstest migration SHALL retain the existing unit and component test
discovery, assertions, and scenarios. Test-only mocks MAY be adapted to
Rstest's public APIs without weakening production types.

#### Scenario: Run repository validation

- **WHEN** contributors run static checks and the unit/component suite
- **THEN** type checking succeeds and the same 41 files and 223 tests pass

### Requirement: Shared test concurrency represents CI

The frontend SHALL use Rstest's default file parallelism in shared
configuration, and constraints that occur only in a local, sandbox, or agent
environment SHALL use environment-local overrides unless reproduced in CI or
another representative environment.

#### Scenario: CI runs the frontend test suite

- **WHEN** the shared Rstest configuration is used in CI
- **THEN** Rstest executes test files with its default file-parallel behavior

#### Scenario: A constrained local environment requires serialization

- **WHEN** test-file parallelism causes resource starvation only in a local,
  sandbox, or agent environment
- **THEN** that environment uses a local override without changing shared test
  concurrency, worker counts, or timeouts

### Requirement: jsdom tests use the VM threads pool

The frontend SHALL run the shared jsdom-based Rstest suite with the
`vmThreads` pool so workers reuse the jsdom runtime while each test file keeps
an isolated VM context. The configuration SHALL retain Rstest's default
file-level parallelism.

#### Scenario: Run the frontend test suite

- **WHEN** contributors or CI run the shared Rstest configuration
- **THEN** Rstest uses the `vmThreads` pool with the existing jsdom environment
  and setup file

#### Scenario: Preserve file-level isolation

- **WHEN** test files mutate DOM globals or declare module mocks
- **THEN** each test file runs in its own isolated VM context rather than
  sharing file state

### Requirement: Runner speed claims require comparable CI evidence

The repository SHALL report a unit-test runner CI speed improvement only after
comparing equivalent CI job durations and test discovery counts. Local timing
alone SHALL NOT be presented as a CI improvement.

#### Scenario: CI performance is unmeasured

- **WHEN** a migrated runner has no comparable CI unit-test run
- **THEN** the repository reports that CI performance is unmeasured
