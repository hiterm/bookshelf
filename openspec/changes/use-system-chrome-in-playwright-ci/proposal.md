## Why

Each Playwright E2E job spends about 25 seconds installing Chromium and Linux
dependencies that are already available through Google Chrome on GitHub-hosted
Ubuntu runners. Using the runner's installed browser removes this repeated setup
while preserving the existing local development workflow.

## What Changes

- Run Playwright E2E tests with Google Chrome Stable on GitHub Actions.
- Stop installing Playwright-managed Chromium and its system dependencies in the
  four Playwright E2E jobs.
- Continue using Playwright-managed Chromium for local E2E runs.
- Preserve the existing E2E projects, test suites, and test commands.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Define browser selection and installation behavior for
  Playwright E2E in CI while preserving local behavior and test coverage.

## Impact

This change affects the three Playwright configuration files and the four
Playwright E2E jobs in `.github/workflows/ci.yml`. It does not change application
behavior, test cases, test targets, or dependencies.
