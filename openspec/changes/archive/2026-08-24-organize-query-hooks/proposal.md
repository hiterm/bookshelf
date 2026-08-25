## Why

Domain-specific TanStack Query hooks currently live in a shared hooks directory, which obscures feature ownership and leaves cache keys duplicated across query and mutation implementations. Organizing these concerns by feature makes server-state access easier to maintain without changing runtime behavior.

## What Changes

- Move book, author, history, and authentication API hooks into each feature's `api` directory.
- Keep generic hooks, including `useDebouncedEffect`, in `src/components/hooks`.
- Introduce one query key factory per feature and replace direct query and invalidation key arrays with those factories.
- Preserve every existing query key value, invalidation target and timing, GraphQL operation and variables, authentication flow, and hook public API.
- Do not rename `src/components`, change the authenticated SDK generation flow, add barrel exports, or alter the latest frontend component names.

## Capabilities

### New Capabilities

- `frontend-query-organization`: Defines feature ownership of TanStack Query hooks and centralized, behavior-preserving query keys.

### Modified Capabilities

None.

## Impact

- Affected code: `src/components/hooks`, feature components and routes importing those hooks, and new `src/features/*/api/queryKeys.ts` modules.
- Public APIs, GraphQL operations, Auth0 behavior, dependencies, and cache semantics remain unchanged.
