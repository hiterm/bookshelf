## Context

The MSW updater commits and pushes `chore/update-msw` with the repository's
`GITHUB_TOKEN`, then creates or reuses an open pull request. GitHub suppresses
workflow runs caused by most events created with that token, so the existing
push-only frontend CI does not validate the generated pull request.

The update must retain its stable branch, force-with-lease update, existing PR
reuse, strict changed-file allowlist, and successful no-op path. The solution
must not add a PAT or GitHub App token.

## Goals / Non-Goals

**Goals:**

- Run the normal frontend CI against the generated update branch whenever an
  MSW change is pushed.
- Preserve the CI workflow's existing push behavior and add no dispatch inputs.
- Use the existing workflow token with least privilege.
- Keep no-op runs from dispatching CI.

**Non-Goals:**

- Add manual dispatch triggers to actionlint or zizmor.
- Change MSW update generation, branch naming, or PR reuse behavior.
- Run frontend integration tests locally.
- Replace the token or automatically merge the generated or implementation PR.

## Decisions

1. Add `workflow_dispatch` alongside `push` in `ci.yml` using mapping syntax.
   This preserves automatic push runs and exposes the workflow dispatch API
   without defining inputs. Adding a separate CI workflow was rejected because
   it could drift from the normal frontend validation suite.
2. Dispatch with `gh workflow run ci.yml --ref chore/update-msw` after the push
   and PR creation/reuse steps. Supplying `--ref` makes the dispatched workflow
   resolve and check out the generated PR head branch instead of `main`.
3. Guard the dispatch step with the existing
   `steps.changes.outputs.changed == 'true'` condition. This reuses the
   authoritative no-op decision and avoids redundant state.
4. Add only `actions: write` to the updater's existing workflow permissions.
   The Actions API requires this repository permission to create a workflow
   dispatch; the existing `contents: write` and `pull-requests: write` grants
   remain necessary for branch and PR management.
5. Continue using `secrets.GITHUB_TOKEN` through `GH_TOKEN`. A PAT or GitHub App
   token is unnecessary because `workflow_dispatch` is an allowed explicit
   workflow trigger and the workflow token can call it with `actions: write`.

## Risks / Trade-offs

- [A dispatch request can succeed before the run is visible in the UI] → Treat
  successful API acceptance as dispatch completion and verify the resulting run
  and its head branch after opening the implementation PR.
- [The stable update branch may receive a later commit] → Dispatch immediately
  after each changed update push so the run is associated with that update's
  current head SHA.
- [Workflow YAML errors can prevent dispatch] → Run repository lint and tests,
  then validate the live GitHub Actions result on the implementation PR.
