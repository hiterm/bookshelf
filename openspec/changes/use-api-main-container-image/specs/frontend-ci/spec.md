## ADDED Requirements

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
