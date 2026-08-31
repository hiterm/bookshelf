## Why

Frontend CI currently runs directly for every branch push, while pull requests created by automation require an explicit workflow dispatch to receive CI coverage. Centering CI on pull request events makes checks visible on every PR and removes special-case orchestration from the MSW update workflow.

## What Changes

- Run frontend CI for pushes to `main` and for all pull requests.
- Stop running frontend CI directly for ordinary feature-branch pushes.
- Remove manual `workflow_dispatch` support from frontend CI.
- Let MSW update pull requests trigger CI through the normal `pull_request` event instead of explicitly dispatching `ci.yml`.
- Remove the MSW update workflow's no-longer-needed `actions: write` permission while preserving its branch reuse, duplicate-PR prevention, and no-op behavior.

## Capabilities

### New Capabilities

- `frontend-ci`: Defines the events that run frontend CI and expose checks on pull requests.

### Modified Capabilities

- `manual-msw-update`: Changes CI handoff for generated MSW update pull requests from explicit workflow dispatch to the standard pull request event.

## Impact

- `.github/workflows/ci.yml` trigger configuration.
- `.github/workflows/update-msw.yml` permissions and post-PR behavior.
- GitHub Actions execution frequency and PR check visibility; no application runtime code or dependencies change.
