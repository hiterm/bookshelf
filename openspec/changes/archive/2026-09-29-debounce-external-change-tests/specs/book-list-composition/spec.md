## ADDED Requirements

### Requirement: Reset discards pending filter drafts

Reset SHALL discard uncommitted string-filter input and cancel its pending debounce even when the corresponding committed URL filter is already absent. Reset SHALL preserve the table instance and column visibility while clearing URL-backed search state.

#### Scenario: Reset before the first string filter commit

- **WHEN** a user enters a string filter and activates Reset before its debounce completes
- **THEN** the input is empty and all books remain visible after pending debounce deadlines, with no stale filter restored in the URL

#### Scenario: Reset while replacing a committed string filter

- **WHEN** a user edits an existing string filter and activates Reset before the replacement is committed
- **THEN** both the committed filter and draft are cleared and cannot reappear after the debounce deadline
