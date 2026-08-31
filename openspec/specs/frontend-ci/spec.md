# frontend-ci Specification

## Purpose
TBD - created by archiving change pr-centered-frontend-ci. Update Purpose after archive.
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
