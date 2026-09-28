## Why

Some asynchronous tests assert an already-true condition before older work finishes, so they can miss stale results overwriting newer state. Other tests claim to preserve hidden selections without revealing them, while several browser smoke cases repeat assertions in the same suite.

## What Changes

- Audit unit, component, mock API, demo, and real-backend suites by responsibility and record prioritized findings.
- Make lookup and import race tests settle controlled promises before checking observable state; cover stale failures and enrichment.
- Verify hidden import selections after revealing rows and consolidate debounce lifecycle checks.
- Remove only browser smoke cases whose assertions remain in existing same-suite workflows.
- Validate selected tests against temporary deliberately broken implementations.

## Capabilities

### New Capabilities

- `test-behavior-contracts`: Deterministic regression checks for asynchronous state and selection preservation.

### Modified Capabilities

None. Product behavior remains unchanged.

## Impact

Test files and a test audit document only; no new dependencies, production API changes, or shared concurrency changes. Real-backend frontend integration runs in CI only.
