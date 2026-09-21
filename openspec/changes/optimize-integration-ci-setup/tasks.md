## 1. Playwright Installation

- [ ] 1.1 Remove `--with-deps` from every CI Playwright browser install while retaining `--only-shell chromium`
- [ ] 1.2 Add a concise workflow comment documenting the GitHub-hosted Ubuntu dependency assumption and CI failure signal

## 2. Integration Setup Concurrency

- [ ] 2.1 Parallelize independent fixed-release integration setup while preserving API version and service readiness dependencies
- [ ] 2.2 Parallelize independent API-main integration setup while preserving explicit image pull, digest logging, and service readiness dependencies
- [ ] 2.3 Verify PostgreSQL 15 and Playwright test configuration, workers, retries, commands, and coverage remain unchanged

## 3. Validation and Measurement

- [ ] 3.1 Run OpenSpec validation and the repository's lightweight local validation commands
- [ ] 3.2 Run GitHub Actions and compare integration job, browser install, service setup, and E2E durations with the main baseline
- [ ] 3.3 Investigate and fix any CI failures or material E2E regressions
