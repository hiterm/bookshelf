## Context

`bookshelf-api.version` is consumed by frontend CI, while Renovate currently discovers API tags on its periodic schedule. Pull requests created with the default workflow token do not reliably trigger ordinary pull-request workflows, so delivery must use the existing GitHub App.

## Goals / Non-Goals

**Goals:** reject malformed versions, make repeated delivery safe, trigger normal PR CI, and test the state transition without a real release.

**Non-Goals:** GraphQL generation in the dispatch workflow, pre-PR compatibility validation, or replacing other Renovate management.

## Decisions

- Accept stable SemVer in `MAJOR.MINOR.PATCH` form through a standalone shell script with a distinct unchanged result.
- Use a GitHub App token scoped to `bookshelf` for checkout, push, and `gh pr create`.
- Use `update/bookshelf-api-<version>` and `Update bookshelf-api to <version>`, querying the exact head branch to prevent duplicate PRs.
- Commit only `bookshelf-api.version`; ordinary PR CI remains the compatibility and generated-file gate.
- Test invalid, changed, and unchanged script behavior with temporary files.

## Risks / Trade-offs

- [Concurrent deliveries] → Deterministic branches and exact-head PR lookup constrain runs to one PR.
- [Incompatible API] → The PR opens and CI reports required follow-up changes.
- [Incomplete App permissions] → Delivery fails visibly with token scope limited to the frontend.
