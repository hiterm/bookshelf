## MODIFIED Requirements

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

## ADDED Requirements

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
