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
