## Context

The four headless Playwright E2E jobs install Chromium with `--with-deps`, which downloads both the full Chromium browser bundle and `chromium-headless-shell`. The tests use Playwright-managed Chromium in headless mode, so the full browser bundle is unused. A previous system Chrome experiment reduced installation time but slowed the test suites and is not an acceptable execution model.

## Goals / Non-Goals

**Goals:**

- Remove the unused full Chromium bundle download from the four E2E jobs.
- Preserve the Playwright-managed Chromium headless shell and all existing test behavior.
- Retain `--with-deps` so required operating-system dependencies remain installed.

**Non-Goals:**

- Changing Playwright browser selection, configuration, commands, workers, retries, or test suites.
- Adding browser, apt, or dependency caches.
- Using system Chrome or a Playwright Docker image.

## Decisions

- Add `--only-shell` to each existing `playwright install --with-deps chromium` command. This is Playwright's supported mechanism for installing only the headless shell and keeps the current runtime browser implementation.
- Apply the same command change to all four Playwright jobs to keep their browser provisioning consistent.
- Leave Playwright configuration and every other workflow step unchanged. The rejected alternative is `channel: "chrome"`, because prior measurements showed materially slower test execution with system Chrome's new headless mode.

## Risks / Trade-offs

- [A future job starts headed Chromium] → Such a job would need to install the full browser explicitly; current CI suites remain headless.
- [Install time does not fall to zero] → Expected because `--with-deps` still checks and installs system packages.
- [Unexpected runtime change] → Verify all four jobs use `chromium-headless-shell`, pass, and retain comparable test duration in GitHub Actions logs.
