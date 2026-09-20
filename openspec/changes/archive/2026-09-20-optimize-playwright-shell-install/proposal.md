## Why

Headless Playwright E2E jobs currently download both the Chromium browser bundle and the Chromium headless shell, even though the tests only use the Playwright-managed headless shell. Avoiding the unused browser bundle reduces CI installation time and network transfer without changing test execution.

## What Changes

- Install only Playwright's Chromium headless shell, while retaining system dependency installation.
- Keep the existing Playwright-managed browser, test suites, commands, and execution settings unchanged.
- Explicitly avoid using system-installed Chrome for the E2E jobs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Require headless Playwright E2E jobs to install only the Chromium headless shell and not the full Chromium browser bundle or system Chrome.

## Impact

- Affects the browser installation steps in the four Playwright jobs in `.github/workflows/ci.yml`.
- Does not affect Playwright configuration, test commands, test coverage, application code, or runtime dependencies.
