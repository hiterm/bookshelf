## Purpose

Define the repository's maintainer-initiated process for updating MSW together
with its checked-in service worker while retaining Renovate release detection.
## Requirements
### Requirement: MSW updates are initiated manually
The repository SHALL provide an MSW update workflow whose only trigger is
`workflow_dispatch`. It SHALL NOT define a schedule or run in response to a
Renovate pull request.

#### Scenario: Maintainer requests an update
- **WHEN** a maintainer dispatches the MSW update workflow
- **THEN** the workflow starts from the current `main` branch

#### Scenario: No maintainer dispatch occurs
- **WHEN** no maintainer dispatches the workflow
- **THEN** no scheduled or Renovate-triggered MSW update workflow runs

### Requirement: Dependency and worker are updated together
The workflow SHALL update `msw` to the latest available version and SHALL
regenerate `public/mockServiceWorker.js` using that installed MSW version and the
repository's configured worker directory.

#### Scenario: A newer MSW version exists
- **WHEN** the workflow resolves a newer MSW release
- **THEN** `package.json`, `pnpm-lock.yaml`, and `public/mockServiceWorker.js` are mutually consistent with the updated version

#### Scenario: Worker regeneration runs
- **WHEN** the workflow regenerates the service worker
- **THEN** it runs only the MSW generator and does not run GraphQL Code Generator or TanStack Router generation

### Requirement: Update output is tightly scoped
The workflow MUST limit its pull request changes to `package.json`,
`pnpm-lock.yaml`, and `public/mockServiceWorker.js` and MUST fail rather than
commit an unexpected changed path.

#### Scenario: Expected files change
- **WHEN** the update changes only allowlisted files
- **THEN** the workflow may commit those files to the update branch

#### Scenario: An unexpected file changes
- **WHEN** the update changes a path outside the allowlist
- **THEN** the workflow fails before committing or pushing the update

### Requirement: Pull request creation is idempotent
The workflow SHALL exit successfully without creating a pull request when the
update produces no diff. When a diff exists, it SHALL use a stable update branch
and SHALL create at most one open pull request for that branch.

#### Scenario: MSW is already current
- **WHEN** dependency update and worker regeneration produce no changes
- **THEN** the workflow exits successfully without creating or updating a pull request

#### Scenario: No update pull request exists
- **WHEN** an update diff exists and no open pull request uses the update branch
- **THEN** the workflow commits and pushes the diff and creates a pull request

#### Scenario: An update pull request already exists
- **WHEN** an update diff exists and an open pull request already uses the update branch
- **THEN** the workflow updates that branch without creating a duplicate pull request

### Requirement: Generated pull requests explain their origin and contents
The generated pull request SHALL identify the MSW version update, service worker
regeneration, and GitHub Actions as its source.

#### Scenario: Reviewer opens the pull request
- **WHEN** a reviewer reads the generated pull request title and body
- **THEN** they can determine that MSW and `mockServiceWorker.js` were updated by GitHub Actions

### Requirement: Renovate detection remains enabled
The repository SHALL retain its existing Renovate MSW package rule so Renovate
continues to detect new MSW versions independently of the manual workflow.

#### Scenario: Manual workflow is added
- **WHEN** the repository adopts the manual MSW update workflow
- **THEN** the MSW rule in `renovate.json5` remains enabled and present

### Requirement: Workflow uses least privilege
The workflow SHALL grant only the repository permissions required to push the
update branch and create or inspect its pull request.

#### Scenario: Workflow permissions are evaluated
- **WHEN** GitHub grants the workflow token permissions
- **THEN** it grants `contents: write` and `pull-requests: write` without broader write permissions

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
