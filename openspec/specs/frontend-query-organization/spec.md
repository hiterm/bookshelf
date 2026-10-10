# frontend-query-organization Specification

## Purpose

Define feature ownership for TanStack Query API hooks and feature-local query
key factories and explicit mutation cache dependencies while preserving API and
authentication behavior.

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

Structural reorganization MUST preserve existing cache key values, query options, GraphQL operations and variables, authentication behavior, and hook public APIs. Invalidation targets MAY change only for explicitly specified cache-coherence corrections. Successful-write invalidation SHALL remain in the mutation success lifecycle; rejected writes SHALL retain cached data and allow explicit retry.

#### Scenario: Existing query executes after reorganization

- **WHEN** a consumer invokes a moved query hook with the same arguments as before
- **THEN** the hook uses the same cache key value, query conditions, API operation, variables, and authentication flow as before

#### Scenario: Existing mutation succeeds after reorganization

- **WHEN** a moved mutation hook completes successfully
- **THEN** it invalidates the documented dependent cache keys in the success lifecycle

#### Scenario: Mutation rejects and the user retries

- **WHEN** an author update or book import fails before a later explicit successful retry
- **THEN** the failed mutation rejects and exposes an error state without removing or invalidating existing domain/history data, and the retry refreshes the successful write's dependent consumers

### Requirement: Explicit mutation cache dependencies

Books and authors mutations SHALL use feature-owned invalidation functions and feature query-key factories with a documented dependency matrix. Successful domain writes SHALL refresh active dependent consumers without requiring remount, focus or reconnect. The frontend MUST NOT unconditionally invalidate or remove all application caches.

#### Scenario: Author update refreshes live embedded author data

- **WHEN** an author name or yomi is updated with author list/detail/revisions and book list/details subscribed
- **THEN** the author consumers and book responses expose the new fields and author revision while immutable book revision snapshots remain unchanged

#### Scenario: Book deletion refreshes authored books

- **WHEN** a book is deleted with its book list/detail and author details subscribed
- **THEN** the book is absent from those consumers, including the author-detail book associations, and existing revision snapshots are retained

#### Scenario: Import refreshes authors and authored books

- **WHEN** import adds books using existing or new authors while book list and author list/details are subscribed
- **THEN** the book list, author directory and authored-book associations refresh without refetching unchanged existing book details

#### Scenario: Domain writes refresh operation history

- **WHEN** book create/update/delete/import or author create/update/delete/merge succeeds with operation history subscribed
- **THEN** the operations list exposes the new operation while immutable existing operation-detail snapshots are retained without refetch

#### Scenario: Existing atomic-save and merge dependencies remain protected

- **WHEN** atomic book create/update or author merge succeeds
- **THEN** book saves retain author-directory and authored-book refresh, book update retains its detail/revision refresh, and merge retains both author details, book list/details and revision-family refresh

#### Scenario: Preview does not mutate domain caches

- **WHEN** a book import is only previewed
- **THEN** no domain or operation-history cache is invalidated
