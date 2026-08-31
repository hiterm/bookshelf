## Context

Frontend CI already uses `push` scoped to `main` plus `pull_request`, while
actionlint and zizmor currently use unscoped push triggers. The repository also
contains Actions workflows that create or update pull requests with
`GITHUB_TOKEN`; GitHub may require approval before workflows run on those pull
requests.

## Goals / Non-Goals

**Goals:**

- Give CI, actionlint, and zizmor the same pull-request-centered trigger model.
- Preserve validation after commits reach `main`.
- Avoid redundant validation on feature-branch push events.
- Treat ordinary and Actions-generated pull requests through the same checks.

**Non-Goals:**

- Changing jobs, permissions, or validation commands.
- Changing CI, release, MSW update, or Renovate validation workflows.
- Bypassing approval requirements for Actions-generated pull requests.
- Adding workflow dispatch or release-PR-specific validation workarounds.

## Decisions

1. Configure both actionlint and zizmor with an explicit `push.branches` list
   containing only `main`, plus an unfiltered `pull_request` trigger. This
   exactly matches the existing frontend CI event model and keeps checks tied
   to pull requests. Keeping an unscoped push trigger was rejected because it
   duplicates validation for branches with pull requests.
2. Rely on GitHub's normal `pull_request` processing for pull requests created
   or updated by Actions. A separate `workflow_run`, `repository_dispatch`, or
   privileged token workaround is rejected because approval-required behavior
   is intentional and the same checks should apply after approval.
3. Leave adjacent workflows unchanged. The release workflow retains its
   `main`-push responsibility, the MSW updater retains its manual PR creation
   responsibility, and Renovate configuration validation remains path-specific.

## Risks / Trade-offs

- [Actions-generated pull requests do not run checks immediately] → Accept the
  approval gate and run the standard pull request checks after approval.
- [Feature branches without pull requests no longer receive actionlint or
  zizmor results] → Validate them when a pull request is opened and again after
  merge to `main`.
- [YAML trigger syntax is malformed] → Run the repository's workflow lint and
  formatting validation before opening the pull request.
