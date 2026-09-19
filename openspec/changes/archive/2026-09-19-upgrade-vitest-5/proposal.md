## Why

Vitest 5 is the current major release, but its matcher type changes make the
existing per-test `@testing-library/jest-dom` imports fail type checking. The
upgrade needs a single Vitest-native matcher setup and verification that the
repository is unaffected by other relevant breaking changes.

## What Changes

- Upgrade Vitest from 4.1.11 to the latest stable 5.x release and update the
  lockfile without retaining obsolete dependencies.
- Register `@testing-library/jest-dom/vitest` once through a Vitest setup file
  instead of importing the generic entry point in component test files.
- Audit the Vitest 5 migration guidance against the APIs and configuration
  actually used by this repository, making only required compatibility changes.
- Verify dependency installation, static checks, unit/component tests, and the
  production build.

## Capabilities

### New Capabilities

- `frontend-test-runtime`: Defines the supported Vitest runtime, shared DOM
  matcher registration, and migration verification requirements.

### Modified Capabilities

None.

## Impact

The frontend development dependencies, pnpm lockfile, Vitest configuration,
test setup, component tests, and current linting documentation are affected.
Application runtime behavior and public APIs are unchanged.
