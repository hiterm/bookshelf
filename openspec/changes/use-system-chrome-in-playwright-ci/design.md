## Context

The four Playwright E2E jobs currently install Playwright-managed Chromium and
its Linux dependencies on every run. GitHub-hosted Ubuntu runners already
provide Google Chrome Stable, while local development relies on the browser
managed by Playwright.

## Goals / Non-Goals

**Goals:**

- Remove browser installation from the four Playwright E2E jobs.
- Select system-installed Google Chrome Stable only when Playwright detects CI.
- Preserve local browser selection and all existing E2E coverage.

**Non-Goals:**

- Rename the Playwright project.
- Add a Playwright browser cache.
- Change E2E test cases, commands, setup, or backend services.

## Decisions

Each Playwright project will retain the name `chromium` and spread the existing
`Desktop Chrome` device settings. Its `use` configuration will set
`channel: isCi ? "chrome" : undefined`. The existing `isCi` value therefore
selects the runner's Google Chrome Stable in GitHub Actions and leaves local
runs on Playwright-managed Chromium.

The workflow will remove only the four `playwright install --with-deps
chromium` steps. No cache replaces them because Playwright will not download a
browser in CI.

## Risks / Trade-offs

- [The runner's Chrome version can change independently of Playwright] → Use
  Playwright's supported `chrome` channel and verify all four E2E jobs in CI.
- [CI and local runs use different browser distributions] → Keep the same
  Playwright device profile, project name, commands, and test suites so the
  browser executable is the only intentional difference.
