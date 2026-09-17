## MODIFIED Requirements

### Requirement: Changed updates run frontend CI
The workflow SHALL rely on the normal pull request event to run frontend CI
after pushing an MSW update and creating or reusing its pull request. It SHALL
NOT explicitly dispatch frontend CI and SHALL NOT require Actions write
permission.

#### Scenario: New update pull request is created
- **WHEN** the workflow pushes a changed MSW update and creates its pull request
- **THEN** the pull request event starts frontend CI and associates its jobs with the pull request checks

#### Scenario: Existing update pull request is reused
- **WHEN** the workflow pushes a changed MSW update and an open pull request already uses `chore/update-msw`
- **THEN** it reuses that pull request and frontend CI validates the updated pull request revision

#### Scenario: Frontend CI checks out the pull request revision
- **WHEN** the update pull request event starts frontend CI for `chore/update-msw`
- **THEN** frontend CI runs against the generated pull request's revision without an explicit workflow dispatch

#### Scenario: MSW update is a no-op
- **WHEN** dependency update and worker regeneration produce no changes
- **THEN** the workflow does not create a pull request or explicitly start frontend CI

## REMOVED Requirements

### Requirement: Frontend CI supports explicit dispatch
**Reason**: Frontend CI is now centered on pull requests and `main` pushes, so explicit dispatch is no longer part of the workflow contract.

**Migration**: Open or update a pull request to run frontend CI for a feature branch; pushes to `main` continue to run CI automatically.
