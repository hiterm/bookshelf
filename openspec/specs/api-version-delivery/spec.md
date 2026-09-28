# api-version-delivery Specification

## Purpose

TBD - created by archiving change automate-api-version-update. Update Purpose after archive.

## Requirements

### Requirement: Released API versions create frontend update pull requests

The frontend repository SHALL process `api-released` repository dispatches by validating `client_payload.version`, updating only `bookshelf-api.version`, and creating a pull request using a GitHub App token.

#### Scenario: A new valid API version is delivered

- **WHEN** a dispatch contains a valid stable semantic version different from `bookshelf-api.version`
- **THEN** the workflow commits it to a dedicated update branch
- **AND** opens `Update bookshelf-api to <version>`
- **AND** ordinary pull-request CI is triggered

#### Scenario: The version is invalid

- **WHEN** the payload version is not `MAJOR.MINOR.PATCH`
- **THEN** the workflow fails before modifying or pushing content

#### Scenario: The version is already current

- **WHEN** the version file already equals the payload
- **THEN** the workflow succeeds without a commit, push, or pull request

#### Scenario: An update pull request already exists

- **WHEN** an open PR already has the deterministic update branch
- **THEN** the workflow succeeds without creating a duplicate

### Requirement: Compatibility remains a pull-request CI responsibility

The dispatch workflow SHALL NOT require GraphQL generation before opening the update pull request.

#### Scenario: The released API is incompatible

- **WHEN** normal PR CI detects generated or compatibility differences
- **THEN** the pull request remains available for normal corrective changes

### Requirement: Renovate does not manage the API version file

Renovate SHALL retain other dependency management while excluding the custom manager and package rule dedicated to `bookshelf-api.version`.

#### Scenario: Renovate configuration is validated

- **WHEN** Renovate loads the configuration
- **THEN** no custom manager targets `bookshelf-api.version`
- **AND** no package rule special-cases `hiterm/bookshelf-api`
