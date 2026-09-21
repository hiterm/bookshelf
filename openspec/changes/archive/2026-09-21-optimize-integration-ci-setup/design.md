## Context

The integration E2E jobs currently serialize PostgreSQL startup, JWKS startup, bookshelf-api startup, and Playwright installation after dependency installation and source generation. Docker implicitly pulls images during `docker run`, and every Playwright installation performs an apt dependency check even though the current GitHub-hosted Ubuntu image already contains the required Chromium libraries. The integration suite deliberately shares one PostgreSQL database and therefore runs with one worker.

## Goals / Non-Goals

**Goals:**

- Remove the redundant Playwright system dependency check from every CI browser install.
- Shorten integration setup by overlapping independent image pulls, browser download, source generation, and service preparation.
- Make all background failures observable and block E2E execution until every prerequisite is ready.
- Preserve the current fixed-release and API-main integration meanings.

**Non-Goals:**

- Changing PostgreSQL 15 or replacing its Docker container with the runner service.
- Changing the Playwright browser, headless shell, test commands, workers, parallelism, retries, or tested behavior.
- Optimizing integration test execution itself.

## Decisions

### Omit `--with-deps` on GitHub-hosted Ubuntu

All four Playwright install commands will use `pnpm exec playwright install --only-shell chromium`. A short YAML comment will state that GitHub-hosted Ubuntu currently includes Chromium's system dependencies and that a future runner-image incompatibility is detected by Playwright startup or E2E failure. Keeping `--with-deps` was rejected because its apt dependency inspection adds time without installing packages on the current runner.

### Use one bounded parallel setup step per integration job

After `pnpm install`, each integration job will start independent setup functions in the background and record their process IDs. The fixed-release job first reads the API version, while the API-main job uses the known `:main` tag. Both can then overlap `pnpm run generate`, the PostgreSQL image pull, the API image pull, the Playwright headless-shell install, and JWKS startup/readiness.

The step waits for every background operation. Only after the image pulls and PostgreSQL/JWKS readiness succeed does it run the containers and wait for the API health endpoint. This keeps dependency edges explicit while avoiding extra workflow jobs, artifacts, or duplicated checkout/install work.

Separate GitHub Actions steps were considered, but steps within a job are sequential and cannot directly overlap. Splitting setup into separate jobs was rejected because moving downloaded browser and Docker state between runners would negate the benefit and increase complexity.

### Preserve service and test semantics

PostgreSQL remains `postgres:15` on the host network. The fixed-release job still uses `bookshelf-api.version`; the API-main job still explicitly pulls `ghcr.io/hiterm/bookshelf-api:main` and logs its digest. E2E begins only after all background setup, PostgreSQL readiness, JWKS readiness, and API health checks succeed.

## Risks / Trade-offs

- [The runner image stops including a required Chromium library] → Browser launch or E2E fails visibly; restore dependency installation or pin/provision the missing library based on the failure.
- [A background process fails without being surfaced] → Capture every PID and `wait` for each one under strict shell error handling before starting E2E.
- [Concurrent network downloads contend for bandwidth] → Limit concurrency to the existing independent downloads and verify actual Actions durations; revert individual overlap if measurements regress.
- [Combined setup logs are interleaved] → Keep operations in named functions and emit concise start/completion messages so failures remain attributable.
