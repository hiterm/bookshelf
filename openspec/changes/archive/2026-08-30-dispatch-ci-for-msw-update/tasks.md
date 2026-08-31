## 1. Frontend CI Dispatch Support

- [x] 1.1 Add a no-input `workflow_dispatch` trigger to `ci.yml` while preserving the push trigger
- [x] 1.2 Grant the MSW updater the minimum Actions permission needed to dispatch CI
- [x] 1.3 Dispatch `ci.yml` for `chore/update-msw` after changed updates push and create or reuse their PR

## 2. Verification

- [x] 2.1 Verify no-op gating, stable branch and PR reuse behavior, and untouched actionlint/zizmor triggers
- [x] 2.2 Run applicable local formatting, validation, unit tests, and type checking without the integration suite
