## Context

Frontend CI currently listens to every `push` and to `workflow_dispatch`. The MSW updater uses the repository `GITHUB_TOKEN` to push `chore/update-msw`, create or reuse a pull request, and explicitly dispatch frontend CI because token-generated pushes do not start another workflow. This makes an automation-specific workflow dispatch responsible for validation instead of letting the pull request own its checks.

The update must preserve the stable branch, force-with-lease push, open-PR reuse, strict changed-file allowlist, and successful no-op path. It must not introduce a PAT or GitHub App token.

## Goals / Non-Goals

**Goals:**

- Expose the normal frontend CI jobs as checks on every pull request.
- Continue validating the repository after commits land on `main`.
- Avoid redundant direct CI runs for feature-branch pushes.
- Remove explicit CI orchestration and excess permission from the MSW updater.

**Non-Goals:**

- Change frontend CI jobs or their commands.
- Change MSW update generation, branch naming, push safety, or PR idempotency.
- Add a replacement manual CI trigger or credentials.
- Run frontend integration tests locally or merge the implementation PR.

## Decisions

1. Configure `ci.yml` with `push.branches: [main]` and `pull_request`. This makes pull requests the validation boundary while retaining post-merge validation on `main`. Keeping an unrestricted `push` trigger was rejected because it duplicates PR runs for ordinary branches.
2. Remove `workflow_dispatch` from `ci.yml`. The only current consumer is the MSW updater, and retaining an unused manual entry point would blur the intended PR-centered execution model.
3. Remove the updater's explicit `gh workflow run` step. The updater remains responsible only for producing the branch and pull request; the opened or updated PR supplies the normal `pull_request` event and check association.
4. Remove `actions: write` from updater permissions. `contents: write` remains necessary for branch updates and `pull-requests: write` remains necessary for PR inspection and creation.
5. Leave every other updater step unchanged. In particular, `chore/update-msw`, force-with-lease, duplicate-PR detection, and the no-op guard remain the authoritative behavior.

## Risks / Trade-offs

- [A branch push without an open PR no longer runs frontend CI] → This is intentional; contributors receive checks once the branch is represented by a pull request.
- [An automation-created PR might not emit the expected pull request workflow] → Verify the implementation PR's live Actions checks and keep CI tied to the standard `pull_request` event rather than introducing broader credentials.
- [A PR branch update can produce a new CI run through pull request synchronization] → Accept this as the desired PR check lifecycle and avoid an additional explicit dispatch that could duplicate runs.
