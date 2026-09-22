## 1. Baseline and focused coverage

- [x] 1.1 Record repeated pre-change BookList and full-suite Vitest timings.
- [x] 1.2 Confirm hook tests prove delay boundaries and cancellation; strengthen only if needed.
- [x] 1.3 Add `StringFilter` fake-timer tests for delay, latest input, and external filter synchronization.

## 2. BookList test composition

- [x] 2.1 Replace the debounce hook with an immediate effect in ordinary BookList tests without removing cases or weakening assertions.
- [x] 2.2 Add one unmocked BookList fake-timer integration test for title filtering, table contents, and Router search.

## 3. Validation and delivery

- [x] 3.1 Run repeated post-change timings for both BookList files and the full Vitest suite; compare medians.
- [x] 3.2 Run generation, lint, formatting, all Vitest tests, and type checking.
- [x] 3.3 Sync the delta spec to the canonical frontend test runtime spec and validate it.
