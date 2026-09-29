## ADDED Requirements

### Requirement: Pending author edits preserve intentional values

Component tests SHALL verify pending-author edits through the final selected author values rather than internal popover state.

#### Scenario: Commit a non-empty edit

- **WHEN** a pending author name is edited and committed by Enter or blur
- **THEN** tests verify the trimmed name and pending identifier replace the previous value

#### Scenario: Cancel or clear an edit

- **WHEN** an edit is canceled by Escape or committed with an empty name
- **THEN** tests verify Escape preserves the original author and an empty committed name removes it

### Requirement: Author deletion tests cover cancellation and recovery

Component tests SHALL distinguish cancellation from mutation and SHALL settle failed deletion work before retrying.

#### Scenario: Cancel deletion

- **WHEN** the user cancels the author deletion confirmation
- **THEN** the delete mutation is not executed

#### Scenario: Failed deletion can be retried

- **WHEN** deletion fails and the user retries successfully
- **THEN** tests verify the author detail remains available after failure and the same author is submitted again before navigation

### Requirement: Book update tests verify persisted fields

The existing mock-API all-fields update flow SHALL verify saved values after reopening the editor.

#### Scenario: Reopen an updated book

- **WHEN** title, ISBN, format, store, priority, read status, and owned status are updated and the edit page is reopened
- **THEN** every updated control exposes the persisted value

### Requirement: Import tests cover submission locking and recovery

Component tests SHALL use controlled asynchronous work to verify preview and import submissions cannot execute twice while pending and become usable after settlement.

#### Scenario: Submission is locked while pending

- **WHEN** preview or import is submitted repeatedly before its controlled promise settles
- **THEN** only one corresponding mutation runs

#### Scenario: Import recovers after settlement

- **WHEN** a pending import succeeds or fails
- **THEN** success navigates once and failure preserves the preview so a later retry can succeed
