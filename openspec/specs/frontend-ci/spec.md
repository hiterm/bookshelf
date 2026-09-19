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
