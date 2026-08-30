## Context

The repository pins Node 24, declares pnpm in `packageManager`, pins GitHub
Actions by commit SHA, and checks generated artifacts in CI. Its existing
`generate:without-fetch` script regenerates GraphQL and router outputs in
addition to the MSW worker, so it is too broad for a focused dependency update.
The repository also keeps an explicit Renovate package rule for MSW.

GitHub suppresses new workflow runs for pushes and pull requests created with
the repository `GITHUB_TOKEN`. The update workflow can therefore create a PR
with least privilege, but the generated PR's push-triggered CI will require a
maintainer action or a future credential-policy decision if automatic CI is
required. This does not affect CI for the implementation PR adding the workflow.

## Goals / Non-Goals

**Goals:**

- Provide an on-demand update path that keeps the dependency, lockfile, and
  checked-in worker synchronized.
- Make repeated dispatches converge on one update branch and pull request.
- Avoid unrelated generated or dependency changes.
- Follow repository conventions for toolchain setup, action pinning, and
  least-privilege permissions.

**Non-Goals:**

- Replacing or disabling Renovate's MSW release detection.
- Scheduling updates or reacting automatically to Renovate pull requests.
- Regenerating GraphQL, API, or TanStack Router artifacts.
- Merging the generated pull request.

## Decisions

- Add `generate:msw` as `msw init` and keep the existing
  `msw.workerDirectory: ["public"]` configuration authoritative. Supplying a
  duplicated directory argument was rejected because it can drift from the
  package configuration; invoking `generate:without-fetch` was rejected because
  it touches unrelated outputs.
- Use `pnpm update --latest --dev msw` to update the direct development
  dependency and its necessary lockfile graph while preserving the repository's
  exact dependency style.
- Implement branch push and pull request creation with the runner's existing
  `git` and `gh` clients instead of adding another third-party action. Use the
  fixed branch `chore/update-msw`, force-update it from the current `main`, and
  create a PR only when one for that head branch does not already exist. This
  makes reruns update the same PR instead of producing duplicates.
- Stage only `package.json`, `pnpm-lock.yaml`, and
  `public/mockServiceWorker.js`, then reject any tracked or untracked change
  outside that allowlist before committing. A broad `git add` was rejected
  because future package-manager behavior could accidentally expand PR scope.
- Detect a no-op before configuring commit identity or pushing. The workflow
  exits successfully when the allowlisted files are unchanged.
- Grant only `contents: write` and `pull-requests: write`, and use
  `GITHUB_TOKEN` for both push and `gh pr create`. A PAT or GitHub App token could
  trigger downstream CI, but no repository credential or policy for one exists.
- Serialize dispatches with a workflow-specific concurrency group to prevent
  simultaneous runs from racing on the fixed branch.

## Risks / Trade-offs

- [PRs created with `GITHUB_TOKEN` do not automatically trigger push-based CI]
  → State this limitation in the design and validate the update within the
  workflow before creating the PR; maintainers can trigger CI through an
  authorized follow-up action.
- [A future pnpm or MSW release changes additional files] → Fail the workflow
  on any path outside the explicit allowlist instead of silently committing it.
- [A previous update branch diverges from `main`] → Recreate the fixed branch
  from the checked-out current `main` and use `--force-with-lease` when pushing.
- [Two manual runs race] → Disable cancellation and serialize them with
  concurrency.
