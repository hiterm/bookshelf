## Why

The unit and component test suite is a material part of CI time. Rstest may reduce that time, but adoption is justified only if existing test behavior and discovery remain equivalent and CI measurements show a benefit.

## What Changes

- Migrate the unit and component test runner from Vitest to Rstest while retaining the `test` and `test:watch` scripts.
- Preserve test discovery, assertions, mocks, setup, jsdom, global APIs, and exclusions.
- Compare local and CI execution under equivalent conditions and report any compatibility or performance trade-offs.
- Keep Playwright E2E suites outside this migration.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `frontend-test-runtime`: Replace the Vitest runtime contract with a parity-checked Rstest experiment and CI performance decision.
- `frontend-ci`: Compare the unit test job with a recent equivalent Vitest job before claiming a CI speed improvement.

## Impact

Test scripts, test configuration, setup, test-only imports and mock APIs, package dependencies and lockfile, active testing guidance, and CI performance reporting. Production code and Playwright E2E behavior remain unchanged.
