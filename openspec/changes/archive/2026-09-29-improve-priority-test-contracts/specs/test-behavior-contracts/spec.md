## ADDED Requirements

### Requirement: Mutation tests observe active cache consumers

Regression tests SHALL use real QueryClient and query/mutation hooks with only the SDK boundary controlled, and SHALL verify refreshed data without remounting or incidental refetch triggers.

#### Scenario: Author merge refreshes related data

- **WHEN** an author is merged while author lists, source/destination details, related book lists/details, and author/book revisions are active
- **THEN** all affected consumers expose the merged data

#### Scenario: Book update refreshes related data

- **WHEN** a book title and author association change while book list/detail, affected author details, and book revisions are active
- **THEN** consumers expose the updated title, associations, and revision

#### Scenario: Failed mutation preserves data and permits retry

- **WHEN** a mutation fails and subsequently succeeds on retry
- **THEN** tests observe the failure with original cache data before observing refreshed data after retry

### Requirement: External detail tests cover transformation and completed races

OpenBD detail tests SHALL exercise user-visible transformations and external failures without network access, and SHALL await stale work completion before checking state.

#### Scenario: Detail transformation

- **WHEN** OpenBD returns descriptions, page extents, empty results, or unknown formats
- **THEN** tests verify description priority, positive integer page counts, absent optional values, and safe empty details

#### Scenario: External failure and recovery

- **WHEN** HTTP, network, JSON, or response-shape errors occur
- **THEN** tests verify an error state and a later successful request can recover

#### Scenario: Superseded or reset detail request

- **WHEN** old success or failure completes after a newer ISBN succeeds or after reset
- **THEN** tests await the old request and verify the newer success or idle state remains

#### Scenario: Preview boundary

- **WHEN** details fail or the preview closes
- **THEN** selection still passes the original search result and closing resets detail state

### Requirement: Book registration tests protect author resolution and recovery

Component tests SHALL observe final form values and registration outcomes across autofill, failure, retry, and pending submission.

#### Scenario: Autofill normalizes and deduplicates authors

- **WHEN** search results contain whitespace, case variants, blanks, repeated existing authors, and repeated new authors
- **THEN** submission reuses existing IDs, removes blanks/duplicates, and leaves only unknown authors pending

#### Scenario: Author creation fails

- **WHEN** author creation fails before book creation
- **THEN** the book is not created, input remains available, and retry can succeed

#### Scenario: Book creation fails after authors resolve

- **WHEN** author creation succeeds but book creation fails
- **THEN** input and resolved author IDs remain available and retry does not recreate the author

#### Scenario: Submission during author creation

- **WHEN** the user submits again while author creation is pending
- **THEN** only one author-resolution and book-creation sequence runs
