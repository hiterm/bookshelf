## Why

The integration E2E jobs are the frontend CI critical path, while several independent setup operations currently run sequentially. GitHub-hosted Ubuntu runners already provide Chromium's system dependencies, so CI can avoid the redundant dependency check and overlap independent downloads without changing test coverage.

## What Changes

- Omit Playwright's `--with-deps` option in every CI job that installs Chromium, with a concise workflow comment documenting the GitHub-hosted runner assumption and its failure signal.
- Run independent integration setup work concurrently after `pnpm install`, including the PostgreSQL 15 image pull, bookshelf-api image pull, Chromium headless shell install, generated-source setup, and JWKS readiness where dependencies allow.
- Preserve image/version dependencies and wait for PostgreSQL, JWKS, bookshelf-api, and Playwright to be ready before integration E2E execution.
- Keep PostgreSQL 15, Playwright browser selection, headless shell usage, integration test scope, workers, parallelism, and retries unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Require GitHub-hosted Ubuntu Playwright jobs to omit the redundant system dependency check and require integration setup to overlap independent operations without changing integration semantics.

## Impact

- Affects `.github/workflows/ci.yml` setup ordering and commands.
- Updates the canonical `frontend-ci` CI behavior contract after validation and archive.
- Does not change application code, runtime dependencies, browser/test configuration, PostgreSQL major version, or integration coverage.
