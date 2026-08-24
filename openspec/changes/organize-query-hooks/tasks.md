## 1. Inventory and Move Hooks

- [x] 1.1 Inventory all domain-specific hooks, consumers, and TanStack Query key usages across the repository
- [x] 1.2 Move book, author, history, and authentication hooks into their feature `api` directories without changing hook logic
- [x] 1.3 Update all route, component, test, and hook imports to use direct feature API paths
- [x] 1.4 Verify only feature-neutral hooks remain in `src/compoments/hooks`
- [x] 1.5 Run required generation, lint, unit test, and typecheck checks for the move-only change

## 2. Centralize Query Keys

- [ ] 2.1 Add feature-local query key factories that reproduce every existing key tuple exactly
- [ ] 2.2 Replace query hook key arrays with the applicable feature query key factory
- [ ] 2.3 Replace mutation invalidation key arrays with factories without changing targets or timing
- [ ] 2.4 Verify GraphQL operations, variables, Auth0 handling, query options, and hook public APIs remain unchanged

## 3. Verify the Refactor

- [ ] 3.1 Search for old hook imports and remaining domain key literals in queries and QueryClient operations
- [ ] 3.2 Run generation, lint, unit tests, and type checking
- [ ] 3.3 Review the complete diff against `main` for preserved cache values, invalidation behavior, and component naming
