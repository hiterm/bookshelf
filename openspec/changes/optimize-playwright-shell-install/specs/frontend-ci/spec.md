## ADDED Requirements

### Requirement: Headless Playwright jobs install only the Chromium headless shell

GitHub Actions jobs that run headless Playwright E2E suites SHALL install the Playwright-managed `chromium-headless-shell` with its required system dependencies, SHALL NOT install the normal Chromium browser bundle, and SHALL NOT use system-installed Chrome.

#### Scenario: Headless E2E browser dependencies are installed

- **WHEN** a headless Playwright E2E job installs its browser dependencies
- **THEN** it installs `chromium-headless-shell` using Playwright's `--only-shell` option with `--with-deps`
- **AND** it does not download the normal Chromium browser bundle

#### Scenario: Headless E2E tests execute after installation

- **WHEN** a headless Playwright E2E suite runs after browser installation
- **THEN** it uses the existing Playwright-managed browser selection and execution mode
- **AND** its test suite, test command, workers, parallelism, and retry behavior remain unchanged
- **AND** it does not select system-installed Chrome
