## 1. Baseline and reproduction

- [x] 1.1 Fetch main and compare #406, #402, #411, current keys/hooks and specifications.
- [x] 1.2 Extend real-hook active-consumer tests and reproduce stale rename/deletion/import/operations data.

## 2. Implementation and documentation

- [x] 2.1 Add feature-owned invalidation helpers and close demonstrated dependencies only on success.
- [x] 2.2 Document the mutation matrix, lifecycle, failure/retry and immutable snapshot boundaries.
- [x] 2.3 Update frontend-query-organization through a delta specification.

## 3. Verification

- [ ] 3.1 Confirm focused failure/retry regressions and sensitivity to each missing dependency.
- [ ] 3.2 Run generation, lint, formatting, unit/coverage tests, typecheck, build, OpenSpec validation and relevant browser suites.
- [ ] 3.3 Record exact results and remaining environment/API limitations, sync and archive the specification change.
