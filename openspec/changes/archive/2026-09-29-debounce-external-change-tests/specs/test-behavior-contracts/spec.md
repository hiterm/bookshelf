## ADDED Requirements

### Requirement: Pending string filter tests observe external changes

Regression tests SHALL exercise externally interrupted string-filter edits through user-visible inputs, displayed books, and URL search, with the production debounce and table behavior intact. Tests SHALL observe state after the superseded debounce deadline and subsequent synchronization work.

#### Scenario: Reset interrupts an edit

- **WHEN** Reset is used before a typed string filter is committed, with or without a previously committed string filter
- **THEN** tests verify that the input stays empty, all books remain visible, and the URL remains reset after debounce work settles

#### Scenario: URL search replaces a pending edit

- **WHEN** an external URL search update changes the committed string filter while a different draft is pending
- **THEN** tests verify the external filter remains in the input, displayed books, and URL after debounce work settles

#### Scenario: History navigation interrupts an edit

- **WHEN** browser history navigation restores a different committed string filter while a draft is pending
- **THEN** tests verify the restored filter remains in the input, displayed books, and URL after debounce work settles
