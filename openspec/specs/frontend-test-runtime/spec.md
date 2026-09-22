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

### Requirement: BookList debounce coverage uses focused timers

The frontend test suite SHALL verify the debounce primitive, the `StringFilter` 1000 ms behavior, and one complete BookList filter-to-Router path with fake timers. Ordinary BookList behavior tests SHALL avoid waiting for the production debounce in real time without weakening their existing table and Router assertions. Production APIs SHALL remain unchanged for test speed.

#### Scenario: Verify the debounce primitive

- **WHEN** dependencies change before the configured delay
- **THEN** the old timer is canceled and only the latest effect runs after the full delay

#### Scenario: Verify StringFilter timing

- **WHEN** a user changes a string input, including a second change during the debounce interval
- **THEN** the column filter remains unchanged before 1000 ms and receives only the latest value at 1000 ms

#### Scenario: Verify the integrated BookList path

- **WHEN** the title input changes in an unmocked BookList test
- **THEN** the table and Router search remain unchanged at 999 ms and both reflect the title filter at 1000 ms

#### Scenario: Verify ordinary BookList behavior

- **WHEN** the ordinary BookList tests run with an immediate debounce-hook mock
- **THEN** their filter, URL restoration, reset, sorting, pagination, and preset assertions still pass without real-time debounce waits

### Requirement: BookList test speed is evaluated in CI

The change SHALL report repeated local timing for the ordinary BookList test, the integrated debounce test, and the full Vitest suite, and SHALL compare CI timing with the previous baseline. Differences within ordinary runner variance SHALL not be presented as clear improvements.

#### Scenario: Evaluate the pull request

- **WHEN** the pull request validation runs
- **THEN** its recorded timing is compared with the previous 14.42 s BookList and 16.72 s full-suite CI measurements, including any lack of improvement
