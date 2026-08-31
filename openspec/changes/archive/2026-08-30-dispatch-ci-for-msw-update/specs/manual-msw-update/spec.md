## ADDED Requirements

### Requirement: Changed updates run frontend CI
The workflow SHALL dispatch the normal frontend CI workflow after pushing an
MSW update and creating or reusing its pull request. It SHALL dispatch CI with
the existing `GITHUB_TOKEN`, SHALL target `chore/update-msw`, and SHALL grant
only the additional Actions permission required for dispatch.

#### Scenario: New update pull request is created
- **WHEN** the workflow pushes a changed MSW update and creates its pull request
- **THEN** it dispatches the frontend CI workflow for `chore/update-msw`

#### Scenario: Existing update pull request is reused
- **WHEN** the workflow pushes a changed MSW update and an open pull request already uses `chore/update-msw`
- **THEN** it reuses that pull request and dispatches frontend CI for the updated branch

#### Scenario: Frontend CI checks out the dispatched ref
- **WHEN** the update workflow dispatches frontend CI with `chore/update-msw` as its ref
- **THEN** frontend CI runs against the generated pull request's head branch

#### Scenario: MSW update is a no-op
- **WHEN** dependency update and worker regeneration produce no changes
- **THEN** the workflow does not dispatch frontend CI

### Requirement: Frontend CI supports explicit dispatch
The frontend CI workflow SHALL retain its push trigger and SHALL also support
`workflow_dispatch` without inputs. Other workflow trigger configurations SHALL
remain unchanged.

#### Scenario: Repository push occurs
- **WHEN** a commit is pushed to the repository
- **THEN** frontend CI starts through its existing push trigger

#### Scenario: Frontend CI is dispatched
- **WHEN** the frontend CI workflow is dispatched for a repository ref
- **THEN** the normal frontend CI jobs run for that ref without requiring inputs

#### Scenario: Lint workflows are inspected
- **WHEN** this change is applied
- **THEN** actionlint and zizmor workflows do not gain a `workflow_dispatch` trigger
