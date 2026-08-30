## Why

Updating MSW through Renovate changes the dependency metadata but does not
guarantee that the checked-in service worker matches the installed MSW version.
A repository-maintained manual workflow is needed to produce a complete,
reviewable update when a maintainer decides to adopt a new MSW release.

## What Changes

- Add a manually dispatched GitHub Actions workflow that updates MSW to the
  latest version, regenerates only its service worker, and opens or updates a
  pull request when those files change.
- Add a focused package script for generating `public/mockServiceWorker.js`
  without running unrelated GraphQL or router generators.
- Limit generated pull request changes to `package.json`, `pnpm-lock.yaml`, and
  `public/mockServiceWorker.js`, and exit successfully without a pull request
  when no update exists.
- Preserve Renovate's existing MSW update detection configuration.

## Capabilities

### New Capabilities

- `manual-msw-update`: Defines the manually initiated, complete, and
  duplicate-resistant MSW dependency and worker update process.

### Modified Capabilities

None.

## Impact

- Adds one workflow under `.github/workflows/` with only repository-content and
  pull-request write permissions.
- Updates `package.json` with a dedicated MSW worker generation script.
- Uses the existing Node 24, pnpm package-manager declaration, pinned action
  versions, and MSW `workerDirectory` configuration.
- Does not change `renovate.json5` or introduce scheduled automation.
