## MODIFIED Requirements

### Requirement: Headless Playwright jobs install only the Chromium headless shell

GitHub Actions jobs that run headless Playwright E2E suites SHALL install the Playwright-managed `chromium-headless-shell` without requesting Playwright's system dependency installation, SHALL NOT install the normal Chromium browser bundle, and SHALL NOT use system-installed Chrome. The workflow SHALL document that GitHub-hosted Ubuntu currently supplies the required Chromium system dependencies and that Playwright or E2E failure detects a future violation of this assumption.

#### Scenario: Headless E2E browser is installed on GitHub-hosted Ubuntu

- **WHEN** a headless Playwright E2E job installs its browser
- **THEN** it installs `chromium-headless-shell` using Playwright's `--only-shell` option without `--with-deps`
- **AND** it does not download the normal Chromium browser bundle

#### Scenario: Runner system dependency assumption becomes invalid

- **WHEN** the GitHub-hosted Ubuntu runner no longer supplies a system dependency required by Chromium
- **THEN** Playwright browser startup or the E2E suite fails the CI job

#### Scenario: Headless E2E tests execute after installation

- **WHEN** a headless Playwright E2E suite runs after browser installation
- **THEN** it uses the existing Playwright-managed browser selection and execution mode
- **AND** its test suite, test command, workers, parallelism, and retry behavior remain unchanged
- **AND** it does not select system-installed Chrome

## ADDED Requirements

### Requirement: Integration CI overlaps independent setup work

The integration E2E jobs SHALL execute independent setup operations concurrently where their dependencies permit, SHALL surface failure from every concurrent operation, and SHALL NOT begin E2E execution until all required services and browser assets are ready.

#### Scenario: Integration prerequisites are prepared

- **WHEN** an integration E2E job finishes package installation
- **THEN** independent source generation, PostgreSQL 15 image pull, bookshelf-api image pull, Playwright Chromium headless shell installation, and JWKS preparation overlap where dependency ordering permits
- **AND** API image selection occurs before its image pull

#### Scenario: Integration services start

- **WHEN** concurrent downloads and prerequisite setup complete successfully
- **THEN** PostgreSQL starts from `postgres:15`
- **AND** bookshelf-api starts only after its selected image is pulled and PostgreSQL and JWKS are ready
- **AND** the job waits for the API health endpoint before running E2E

#### Scenario: Concurrent setup fails

- **WHEN** any concurrent setup operation fails
- **THEN** the integration job fails before running E2E

#### Scenario: Integration E2E executes after setup

- **WHEN** PostgreSQL, JWKS, bookshelf-api, and the Playwright browser are all ready
- **THEN** the existing integration E2E command and validation scope run unchanged
- **AND** workers, parallelism, and retry behavior remain unchanged
