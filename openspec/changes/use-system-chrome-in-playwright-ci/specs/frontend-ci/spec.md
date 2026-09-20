## ADDED Requirements

### Requirement: Playwright E2E selects its browser by environment

GitHub Actions Playwright E2E jobs SHALL use the Google Chrome Stable browser
preinstalled on the GitHub-hosted Ubuntu runner and SHALL NOT install
Playwright-managed Chromium or its system dependencies. Local Playwright E2E
runs SHALL continue to use Playwright-managed Chromium. Browser selection SHALL
NOT change the E2E test suites, test cases, or Playwright project name.

#### Scenario: Playwright E2E runs in GitHub Actions

- **WHEN** any Playwright E2E job runs on a GitHub-hosted Ubuntu runner
- **THEN** Playwright launches the runner's Google Chrome Stable through the
  `chrome` channel without a Playwright browser installation step

#### Scenario: Playwright E2E runs locally

- **WHEN** a developer runs any Playwright E2E suite outside CI
- **THEN** Playwright uses its managed Chromium browser as before

#### Scenario: Browser selection changes

- **WHEN** CI browser selection is configured to use Google Chrome Stable
- **THEN** the existing E2E test suites, test cases, commands, and `chromium`
  project name remain unchanged
