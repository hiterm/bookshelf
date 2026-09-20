## Why

The shared Vitest configuration serializes all test files to accommodate a
resource-constrained local agent environment, even though the limitation was
not reproduced in CI. This makes the CI test job substantially slower and
prevents CI from using Vitest's supported default file parallelism.

## What Changes

- Remove the shared `fileParallelism: false` override so Vitest uses its
  default file-parallel execution in CI and normal development environments.
- Document that local or agent resource constraints must use local overrides
  unless the problem is reproduced in CI or another representative
  environment.
- Measure the resulting CI duration and stability without changing pool,
  isolation, worker-count, timeout, or test-organization settings.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Require shared Vitest concurrency settings to remain
  representative of CI and direct environment-specific constraints to local
  overrides.

## Impact

- `vite.config.ts` no longer disables Vitest file parallelism globally.
- `AGENTS.md` gains guidance for environment-specific test settings.
- Frontend unit and component tests execute concurrently by default, affecting
  CI duration and potentially exposing hidden cross-file coupling.
