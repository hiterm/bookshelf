## 1. Investigation and regression coverage

- [x] 1.1 Audit the existing hook, StringFilter, routing, and tests for coverage gaps.
- [ ] 1.2 Add behavior-level cases for pending input interrupted by Reset and URL search changes; report any reproduced defect before production changes.
- [ ] 1.3 Verify pending-input history navigation using an appropriate test layer.

## 2. Validation and delivery

- [ ] 2.1 Run generation, lint, formatting, unit tests, typecheck, and applicable browser tests; leave real-backend integration to CI.
- [ ] 2.2 Synchronize the delta spec and archive this change, keeping OpenSpec and source changes in separate commits.
- [ ] 2.3 Create a PR, resolve CI failures, and request CodeRabbit review after CI passes; address feedback until approved without merging.
