## 1. Baseline and capability gate

- [x] Record the Vitest version, Node version, test manifest, counts, runner duration, and wall time.
- [x] Install and inspect the official migration skill and select a compatible Rstest version.

## 2. Migration

- [ ] Port scripts, configuration, setup, global types, and test-only APIs while preserving Playwright E2E and production code.
- [ ] Verify test discovery, behavior, snapshots, setup, jsdom, global APIs, and exclusions against the baseline.
- [ ] Run the required repository checks and compare local timings under equivalent conditions.

## 3. CI and decision

- [ ] Open a pull request and compare its unit test job with comparable Vitest CI.
- [ ] Resolve CI failures and CodeRabbit findings, then document the adoption decision and trade-offs.
- [ ] Synchronize delta specs and archive this OpenSpec change separately from implementation changes.
