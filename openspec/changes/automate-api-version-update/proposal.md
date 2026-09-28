## Why

Frontend API-version updates currently wait for Renovate's schedule after an API release. The release event should create the update pull request immediately so compatibility is checked without avoidable delay.

## What Changes

- Receive `api-released` repository dispatches in the frontend repository.
- Validate the semantic version, update `bookshelf-api.version`, and create a deduplicated pull request with a GitHub App token.
- Treat an already-current version as a successful no-op.
- Keep generated GraphQL artifacts out of the dispatch workflow so normal pull request CI remains the compatibility gate.
- Remove only the Renovate rules that manage `bookshelf-api.version`.

## Capabilities

### New Capabilities

- `api-version-delivery`: Immediate, authenticated, and idempotent delivery of released API versions to frontend pull requests.

### Modified Capabilities

None.

## Impact

- Adds a repository-dispatch workflow and a small tested update script.
- Uses the existing delivery GitHub App credentials.
- Changes `renovate.json5` only by removing API-version ownership.
