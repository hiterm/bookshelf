## 1. Investigate

- [x] 1.1 Read PR #395 and prior performance evidence; start from freshly pulled main a91368c.
- [x] 1.2 Trial the BookList split with unchanged test bodies and reject it after local and CI comparisons.
- [x] 1.3 Trial explicit Node environments and reject them without measured improvement.
- [x] 1.4 Measure per-test executable schema reuse in mock-API fixtures and adopt the small change with explicit measurement limitations.

## 2. Validate and record

- [x] 2.1 Compare alternating runs on the same machine and verify complete test identities and first-attempt success.
- [x] 2.2 Run generation, lint, formatting, 228 unit tests, typecheck, 53 local mock-API tests, and all CI suites; inspect fixture ownership and unchanged test bodies.
- [x] 2.3 Record raw measurements, rejected approaches, adoption rationale, and reproduction steps; remove temporary CI measurement overhead.

Synchronization/archive and final CI/review delivery are tracked in the ExecPlan after these implementation tasks.
