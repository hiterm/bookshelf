# frontend-query-organization Specification

## Purpose
Define feature ownership for TanStack Query API hooks and feature-local query
key factories while preserving existing cache, API, and authentication behavior.
## Requirements
### Requirement: Feature-owned domain API hooks
The frontend SHALL store domain-specific TanStack Query hooks in the owning feature's flat `api` directory and SHALL keep feature-neutral hooks in the shared hooks directory.

#### Scenario: Domain hook location
- **WHEN** a hook accesses book, author, history, or authentication server state
- **THEN** the hook is located under the corresponding `src/features/<feature>/api` directory

#### Scenario: Shared hook location
- **WHEN** a hook is generic and has no feature ownership
- **THEN** the hook remains in `src/components/hooks`

### Requirement: Feature-local query key factories
The frontend SHALL define query key tuples through a query key factory owned by each applicable feature and SHALL use those factories for queries and QueryClient cache operations.

#### Scenario: Query declares a cache key
- **WHEN** a feature query hook supplies a TanStack Query key
- **THEN** it obtains the key from that feature's query key factory

#### Scenario: Mutation invalidates cached data
- **WHEN** a feature mutation invalidates a TanStack Query cache entry
- **THEN** it obtains the invalidation key from the applicable feature query key factory

### Requirement: Cache and API behavior preservation
The refactor MUST preserve all existing cache key values, invalidation targets and timing, query options, GraphQL operations and variables, authentication behavior, and hook public APIs.

#### Scenario: Existing query executes after reorganization
- **WHEN** a consumer invokes a moved query hook with the same arguments as before
- **THEN** the hook uses the same cache key value, query conditions, API operation, variables, and authentication flow as before

#### Scenario: Existing mutation succeeds after reorganization
- **WHEN** a moved mutation hook completes successfully
- **THEN** it invalidates the same cache keys at the same point in the mutation lifecycle as before
