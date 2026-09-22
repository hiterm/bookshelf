# frontend-ci Specification

## Purpose

Define frontend validation for pull requests and pushes to `main`.

## Requirements

### Requirement: Frontend CI validates pull requests

The frontend CI workflow SHALL run its normal jobs for pull request events so
that validation results are associated with the pull request's checks.

#### Scenario: Pull request is opened

- **WHEN** a pull request is opened against the repository
- **THEN** frontend CI runs for the pull request and reports its jobs as pull request checks

#### Scenario: Pull request branch is updated

- **WHEN** new commits update an open pull request
- **THEN** frontend CI runs against the updated pull request revision

### Requirement: Frontend CI validates main pushes

The frontend CI workflow SHALL run for pushes to `main` and SHALL NOT run
directly for ordinary pushes to other branches.

#### Scenario: Commit is pushed to main

- **WHEN** a commit is pushed to `main`
- **THEN** frontend CI runs for that commit

#### Scenario: Commit is pushed to a feature branch

- **WHEN** a commit is pushed to a branch other than `main`
- **THEN** the push event does not directly start frontend CI

### Requirement: Frontend CI has no manual dispatch trigger

The frontend CI workflow SHALL NOT support `workflow_dispatch`.

#### Scenario: Workflow triggers are inspected

- **WHEN** the frontend CI workflow configuration is evaluated
- **THEN** it contains `push` scoped to `main` and `pull_request` without `workflow_dispatch`

### Requirement: Actions validation runs as pull request checks

The actionlint and zizmor workflows SHALL run for pull request events so that
their results are reported as checks on ordinary and Actions-generated pull
requests after any required workflow approval.

#### Scenario: Ordinary pull request is opened or updated

- **WHEN** a pull request is opened or its branch receives a new commit
- **THEN** actionlint and zizmor run for the pull request revision

#### Scenario: Actions-generated pull request is approved

- **WHEN** a pull request created or updated with `GITHUB_TOKEN` receives any
  required workflow approval
- **THEN** actionlint and zizmor run through the same `pull_request` checks as
  an ordinary pull request

### Requirement: Actions validation runs for main pushes only

The actionlint and zizmor workflows SHALL run for pushes to `main` and SHALL
NOT run directly for ordinary pushes to other branches.

#### Scenario: Commit is pushed to main

- **WHEN** a commit is pushed to `main`
- **THEN** actionlint and zizmor run for that commit

#### Scenario: Commit is pushed to a feature branch

- **WHEN** a commit is pushed to a branch other than `main`
- **THEN** the push event does not directly start CI, actionlint, or zizmor

### Requirement: Actions-generated pull requests use no validation workaround

The repository SHALL rely on standard pull request events and SHALL NOT add a
release-PR-specific or updater-PR-specific validation dispatch workaround.

#### Scenario: Workflow-generated pull request requires approval

- **WHEN** GitHub marks workflows for an Actions-generated pull request as
  requiring approval
- **THEN** the repository preserves that approval gate instead of dispatching
  validation through another event

### Requirement: Frontend CI tests compatibility with the API main image

The `test-integration-api-main` job SHALL test the frontend revision against
`ghcr.io/hiterm/bookshelf-api:main` and SHALL NOT check out or release-build the
API source code locally.

#### Scenario: API main compatibility job starts

- **WHEN** `test-integration-api-main` prepares its API dependency
- **THEN** it explicitly pulls `ghcr.io/hiterm/bookshelf-api:main`, logs the pulled image digest, and starts that image with the integration environment

#### Scenario: API main image becomes ready

- **WHEN** the pulled API container starts with PostgreSQL and the JWKS server
- **THEN** the job waits for `/health` before running the frontend integration test suite

#### Scenario: Frontend revision is incompatible with API main

- **WHEN** the frontend integration tests fail against the pulled API `main` image
- **THEN** the job fails and its logs identify the exact image digest used

### Requirement: Fixed-release integration semantics remain unchanged

The existing `test-integration` job SHALL continue to use the API version fixed
by the repository's release-version file.

#### Scenario: Fixed-release integration runs

- **WHEN** `test-integration` starts its API dependency
- **THEN** it uses the configured release image rather than the rolling `:main` image

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

### Requirement: Runner speed claims use comparable CI measurements

The repository SHALL claim a unit-test runner CI speed improvement only after comparing its unit test job duration with a recent equivalent job on the previous runner. The comparison SHALL disclose material differences in environment, workflow, test discovery, or worker settings.

#### Scenario: A replacement runner has no CI measurement

- **WHEN** a runner experiment stops before a comparable CI run
- **THEN** its report states that a CI speed comparison is unavailable

#### Scenario: A replacement runner reaches CI

- **WHEN** a replacement runner's unit test job completes in CI
- **THEN** its duration and discovery counts are compared with an equivalent previous-runner job before claiming a speed improvement
