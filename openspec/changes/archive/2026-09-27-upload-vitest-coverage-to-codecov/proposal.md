## Why

Vitest coverage is visible only inside individual GitHub Actions runs, so the project cannot track coverage trends or inspect coverage from Codecov. Uploading the existing CI coverage through Codecov provides that visibility without turning coverage percentages into a merge gate.

## What Changes

- Generate a machine-readable Vitest coverage report alongside the existing text report.
- Upload the report from the frontend unit-test job with the official `codecov/codecov-action`.
- Keep coverage informational and do not introduce coverage thresholds.
- Do not add `codecov.yml` while no repository-specific Codecov policy is required.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Upload frontend unit-test coverage to Codecov while retaining the existing human-readable report and non-blocking coverage percentages.

## Impact

- `.github/workflows/ci.yml` gains the Codecov upload step.
- `vite.config.ts` emits an LCOV report in addition to the text report.
- Codecov becomes an external CI integration; no application runtime behavior or API changes.
