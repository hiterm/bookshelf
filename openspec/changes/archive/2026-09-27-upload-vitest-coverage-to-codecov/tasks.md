## 1. Coverage Report

- [x] 1.1 Configure Vitest to emit LCOV alongside the existing text coverage report
- [x] 1.2 Verify the coverage command creates `coverage/lcov.info` without enforcing thresholds

## 2. Codecov Integration

- [x] 2.1 Add the pinned official Codecov action to the CI unit-test job with the explicit LCOV path and OIDC authentication
- [x] 2.2 Validate the workflow and confirm no `codecov.yml` is required

## 3. Verification

- [x] 3.1 Run the required local generation, lint, formatting, unit-test coverage, and type-check commands without running integration tests
- [x] 3.2 Verify the pull request CI uploads coverage successfully to Codecov
