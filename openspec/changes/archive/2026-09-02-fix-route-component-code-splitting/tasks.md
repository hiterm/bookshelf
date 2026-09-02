## 1. Baseline Investigation

- [x] 1.1 Confirm the worktree is clean at the recorded latest-main base and inspect every `src/routes/**/*.{ts,tsx}` file for exported local values used by code-splittable route properties
- [x] 1.2 Run the focused history route unit tests before editing and record the TanStack Router warning and affected export names
- [x] 1.3 Check all direct imports of `HistoryIndexPage` and `HistoryDetailPage` to choose private functions or ignored non-route files

## 2. Route Implementation

- [x] 2.1 Remove the `HistoryIndexPage` export from its route file while preserving route behavior and testability
- [x] 2.2 Remove the `HistoryDetailPage` export from its route file while preserving route behavior and testability
- [x] 2.3 Regenerate route artifacts and confirm no additional matching route-file export patterns exist

## 3. Architecture Documentation

- [x] 3.1 Add `docs/architecture/routing.md` with the minimal durable TanStack Router automatic-code-splitting convention and official reference
- [x] 3.2 Add architecture documentation guidance and the routing document link to `AGENTS.md`

## 4. Warning and Behavior Verification

- [x] 4.1 Run the focused history route tests and confirm the TanStack Router code-splitting export warning is absent
- [x] 4.2 Run the full unit suite and confirm no equivalent warning remains for another route file
- [x] 4.3 Verify history list and detail route behavior remains covered without directly re-exporting components from route files

## 5. Repository Validation

- [x] 5.1 Run `pnpm run lint:fix`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build`
- [x] 5.2 Review generated files and the final diff for route-generation impact and unrelated changes
- [x] 5.3 Reconcile every OpenSpec requirement and task with the implementation before syncing and archiving the change
