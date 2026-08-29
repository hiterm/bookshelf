## 1. Effective Import Targets

- [x] 1.1 Derive effective import targets from visible candidates intersected with retained selection
- [x] 1.2 Use effective targets for settings and mobile counts, Preview enablement, and Preview inputs
- [x] 1.3 Invalidate retained Preview state when the purchase-date filter changes

## 2. Regression Coverage

- [x] 2.1 Update filtered-selection tests to assert only effective targets are previewed and restored when the date range widens
- [x] 2.2 Cover inclusive boundaries, manual deselection, zero targets, and successful Preview invalidation
- [x] 2.3 Verify mobile actions display the effective target count

## 3. Verification

- [x] 3.1 Run generated-artifact, formatting/lint, unit-test, typecheck, build, and OpenSpec validation checks
- [x] 3.2 Sync the completed delta spec to the canonical book-import spec and archive the change
