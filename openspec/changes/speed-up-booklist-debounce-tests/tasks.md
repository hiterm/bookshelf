## 1. Baseline and focused coverage

- [x] 1.1 Record repeated pre-change BookList and full-suite Vitest timings.
- [ ] 1.2 Confirm hook tests prove delay boundaries and cancellation; strengthen only if needed.
- [ ] 1.3 Add `StringFilter` fake-timer tests for delay, latest input, and external filter synchronization.

## 2. BookList test composition

- [ ] 2.1 Replace the debounce hook with an immediate effect in ordinary BookList tests without removing cases or weakening assertions.
- [ ] 2.2 Add one unmocked BookList fake-timer integration test for title filtering, table contents, and Router search.

## 3. Validation and delivery

- [ ] 3.1 Run repeated post-change timings for both BookList files and the full Vitest suite; compare medians.
- [ ] 3.2 Run generation, lint, formatting, all Vitest tests, and type checking.
- [ ] 3.3 Sync the delta spec, archive the change, and open a PR with timing and coverage details.
- [ ] 3.4 Review CI measurements and failures, request CodeRabbit review after passing CI, and address findings until approval.
