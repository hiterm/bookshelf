## Context

The frontend uses Vitest 5.0.1 with jsdom, VM threads, global test APIs, a shared setup file, and explicit E2E exclusions. The suite currently contains 41 files and 223 tests. Rstest uses a different compiler and mock implementation, so a green exit alone cannot establish equivalence.

## Goals / Non-Goals

**Goals:** Preserve the unit/component suite's discovery and behavior, and measure whether Rstest improves CI unit test time.

**Non-Goals:** Migrate Playwright E2E, change production code, weaken assertions, or tune Vitest solely to favor Rstest.

## Decisions

- Follow the official `migrate-to-rstest` skill and use the installed Rstest version's CLI and types as the configuration source.
- Record Vitest counts, manifest, Node version, runner duration, and wall time before changing the runner. Keep Vitest installed until Rstest passes with parity.
- Port scripts, config, setup, and global types first. Translate test-only APIs only where required; avoid broad test rewrites and temporary aliases.
- Compare identical file manifests, coverage mode, Node version, and default worker settings. Capture CI job duration from comparable workflow runs. Claim improvement only with measurements.
- Keep the existing Playwright scripts, configuration, and suites.

## Risks / Trade-offs

- Rstest may discover fewer files or tests. Compare manifests and counts before considering success.
- Mock or matcher differences may require many test edits. Report the cost and stop if preserving behavior needs extensive workarounds.
- Rstest may be slower on CI despite local gains. Diagnose build versus execution time before tuning one variable at a time.

## Migration Plan

Record the baseline, add Rstest beside Vitest, port configuration and setup, validate behavior and parity, measure locally and in CI, then remove Vitest only if the migration remains justified. Revert the branch to the baseline runner if compatibility or CI performance fails the experiment.

## Open Questions

- Does the resolved Rstest version support all current mock patterns without complex workarounds?
- Do comparable GitHub Actions runs demonstrate a meaningful speed improvement?
