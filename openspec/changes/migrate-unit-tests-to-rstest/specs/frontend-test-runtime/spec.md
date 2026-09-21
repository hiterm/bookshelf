## MODIFIED Requirements

### Requirement: Vitest 5 is the supported unit-test runtime

The frontend SHALL use Rstest for unit and component tests only when it preserves Vitest test discovery and behavior and its measured CI unit test runtime improves over a comparable Vitest run. The package metadata and lockfile SHALL resolve the selected runner consistently.

#### Scenario: Install test dependencies from the lockfile

- **WHEN** contributors install dependencies with the frozen lockfile
- **THEN** pnpm installs the selected runner without dependency-resolution changes

### Requirement: DOM matchers use the Vitest integration

The test environment SHALL register `@testing-library/jest-dom` matchers in the shared Rstest setup file, and TypeScript SHALL recognize those matchers together with Rstest global APIs without handwritten matcher declarations or suppressed library checking.

#### Scenario: Type-check a component matcher assertion

- **WHEN** a component test uses a jest-dom matcher through global `expect`
- **THEN** TypeScript accepts the matcher and Rstest executes it at runtime

### Requirement: Migration preserves test behavior

The runner migration SHALL retain existing unit and component test files, cases, assertions, mocks, skips, and snapshots without changing production behavior.

#### Scenario: Run repository validation

- **WHEN** static checks and unit/component tests run under the selected runner
- **THEN** all commands complete successfully with the same test discovery and assertions as the Vitest baseline

### Requirement: Shared test concurrency represents CI

The frontend SHALL use the selected runner's default file parallelism in shared configuration. Constraints that occur only in a local, sandbox, or agent environment SHALL use environment-local overrides unless reproduced in CI or another representative environment.

#### Scenario: CI runs the frontend test suite

- **WHEN** the shared runner configuration is used in CI
- **THEN** it executes test files with default file parallelism

#### Scenario: A constrained local environment requires serialization

- **WHEN** test-file parallelism causes resource starvation only in a local, sandbox, or agent environment
- **THEN** that environment uses a local override without changing shared concurrency, worker counts, or timeouts

### Requirement: jsdom tests use the VM threads pool

The frontend SHALL run the jsdom-based suite with file isolation and shared setup behavior equivalent to the Vitest baseline, using the selected runner's supported pool.

#### Scenario: Run the frontend test suite

- **WHEN** contributors or CI run the shared test configuration
- **THEN** tests receive jsdom, registered DOM matchers, and global test APIs

#### Scenario: Preserve file-level isolation

- **WHEN** test files mutate DOM globals or declare module mocks
- **THEN** each test file runs in an isolated context rather than sharing file state
