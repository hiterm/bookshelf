## Why

The actionlint and zizmor workflows currently run for every push, unlike the
frontend CI workflow. Aligning them around pull request checks and `main`
pushes avoids duplicate feature-branch validation and gives all ordinary
validation a consistent review model.

## What Changes

- Run actionlint and zizmor for pull request events.
- Continue running actionlint and zizmor for pushes to `main`.
- Stop directly running actionlint and zizmor for ordinary feature-branch
  pushes.
- Accept the repository's approval-required behavior for pull requests created
  or updated by Actions using `GITHUB_TOKEN`, without adding a workaround.
- Leave the frontend CI, release, MSW update, and Renovate validation workflows
  unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Extend the pull-request-centered validation model to the
  actionlint and zizmor workflows.

## Impact

The trigger configuration changes only in
`.github/workflows/actionlint.yml` and `.github/workflows/zizmor.yml`.
Pull request checks and branch protection may observe actionlint and zizmor
under pull request events instead of feature-branch push events. No runtime
code, dependencies, or application APIs change.
