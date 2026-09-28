## ADDED Requirements

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
