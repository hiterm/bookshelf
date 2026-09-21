# frontend-test-runtime Specification

## Purpose

Define the supported frontend unit-test runtime and shared DOM matcher setup.

## Requirements

### Requirement: Vitest 5 is the supported unit-test runtime

The frontend SHALL use the latest stable Vitest 5.x release on supported Node.js
and Vite versions, with package metadata and the lockfile resolving consistently.

#### Scenario: Install test dependencies from the lockfile

- **WHEN** contributors install dependencies with the frozen lockfile
- **THEN** pnpm installs Vitest 5 without dependency-resolution changes

### Requirement: DOM matchers use the Vitest integration

The test environment SHALL register `@testing-library/jest-dom/vitest` from one
Vitest setup file, and TypeScript SHALL recognize jest-dom matchers together with
`vitest/globals` without handwritten matcher declarations or suppressed library
checking.

#### Scenario: Type-check a component matcher assertion

- **WHEN** a component test uses a jest-dom matcher through global `expect`
- **THEN** TypeScript accepts the matcher and Vitest executes it at runtime

### Requirement: Migration preserves test behavior

The Vitest 5 migration SHALL retain existing unit and component test assertions,
and SHALL add compatibility changes only for breaking behavior used by the
repository.

#### Scenario: Run repository validation

- **WHEN** static checks, unit/component tests, and the production build run
- **THEN** all commands complete successfully without Vitest 5 workarounds for
  unused features

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

### Requirement: jsdom tests use the VM threads pool

The frontend SHALL run the shared jsdom-based Vitest suite with the
`vmThreads` pool so workers reuse the jsdom runtime while each test file keeps
an isolated VM context. The configuration SHALL retain Vitest's default
file-level parallelism.

#### Scenario: Run the frontend test suite

- **WHEN** contributors or CI run the shared Vitest configuration
- **THEN** Vitest uses the `vmThreads` pool with the existing jsdom environment
  and setup file

#### Scenario: Preserve file-level isolation

- **WHEN** test files mutate DOM globals or declare module mocks
- **THEN** each test file runs in its own isolated VM context rather than
  sharing file state

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
