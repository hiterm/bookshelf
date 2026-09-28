## Why

PR #395 strengthened regression detection and documented distinct test boundaries. Reduce feedback time without discarding those protections, using measured comparisons against latest main (`a91368c`).

## What Changes

- Profile the current suite and investigate avoidable DOM query, fixture, and environment overhead.
- Adopt only measured improvements that retain existing assertions, asynchronous completion checks, and isolation.
- Record experiments, raw measurements, rejected alternatives, and validation in the PR and a new investigation document.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Require evidence and preservation of regression coverage for runtime optimizations.

## Impact

Test sources and supporting test configuration only as justified by experiments. No production behavior, dependency upgrades, shared concurrency reductions, or local backend integration runs. OpenSpec artifacts and implementation are committed separately.
