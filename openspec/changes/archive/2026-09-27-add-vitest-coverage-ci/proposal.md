## Why

The frontend CI currently runs Vitest without exposing coverage, making it difficult to identify untested files and lines while reviewing changes. Coverage should be visible directly in GitHub Actions without introducing an external reporting service or a quality gate.

## What Changes

- Collect Vitest coverage during the existing frontend CI unit-test run.
- Show overall and per-file Statements, Branches, Functions, Lines, and uncovered line numbers in GitHub Actions.
- Present the coverage table in the GitHub Actions step summary for quick review while retaining it in the test log.
- Do not configure coverage thresholds, upload reports, save artifacts, or generate an HTML report.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-ci`: Require the frontend CI unit-test job to collect and display detailed Vitest coverage without gating CI on coverage percentages.

## Impact

- `.github/workflows/ci.yml` unit-test execution and step summary output.
- Frontend package scripts and Vitest coverage configuration.
- Development dependency and pnpm lockfile for the Vitest coverage provider.
