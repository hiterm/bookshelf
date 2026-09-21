## 1. Baseline and capability gate

- [x] Record the Vitest version, Node version, test manifest, counts, runner duration, and wall time.
- [x] Install and inspect the official migration skill and select a compatible Rstest version.

## 2. Migration trial

- [x] Trial scripts, configuration, setup, global types, and test-only APIs while preserving Playwright E2E and production code.
- [x] Verify runtime discovery, behavior, snapshots, setup, jsdom, global APIs, and exclusions against the baseline.
- [x] Run TypeScript validation and compare local timings under equivalent conditions; record the failed typecheck gate.

## 3. Decision and record

- [x] Document why no comparable Rstest CI run was made and keep Vitest as the supported runner.
- [x] Open a pull request, confirm its existing Vitest CI, and document the adoption decision and trade-offs.
- [ ] Resolve CodeRabbit findings, synchronize the revised delta specs, and archive this OpenSpec change.
