# test-behavior-contracts Specification

## Purpose

Ensure regression tests observe completed asynchronous work, preserve hidden import selections, and verify debounce cancellation.

## Requirements

### Requirement: Async regression tests observe completed stale work

The test suite SHALL settle controlled asynchronous work before asserting that stale lookup or import results cannot replace newer state.

#### Scenario: Lookup supersession

- **WHEN** an older search succeeds or fails after a newer search, or older enrichment completes after a newer search
- **THEN** tests await the older search completion and verify that the newer result remains

#### Scenario: Empty lookup resets pending work

- **WHEN** an empty query resets a pending lookup and the older request completes
- **THEN** tests verify that the state remains idle without another fetch

#### Scenario: Import supersession

- **WHEN** an older file read succeeds or fails after a newer file is loaded
- **THEN** tests settle that read and verify that the newer rows remain without stale errors

### Requirement: Selection tests expose preserved hidden state

Component tests SHALL verify hidden import selections by revealing the rows after visible bulk selection changes.

#### Scenario: Bulk selection under a filter

- **WHEN** visible rows are deselected and selected under a purchase-date filter
- **THEN** revealing all rows proves that hidden selections are retained and only visible selections change

### Requirement: Debounce tests cover cancellation

Hook tests SHALL verify the delay boundary, dependency changes, and cancellation on unmount using a controlled clock.

#### Scenario: Unmount before the deadline

- **WHEN** a hook is unmounted before its delay expires
- **THEN** advancing beyond the deadline does not call its effect

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
