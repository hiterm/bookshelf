## ADDED Requirements

### Requirement: View book edit history
The system SHALL display a chronological list of edit events for a book on the book detail page.

#### Scenario: Book detail page shows history
- **WHEN** user navigates to a book detail page
- **THEN** the page displays a "History" section containing all `bookEvents` for that book, ordered by `changedAt` descending

#### Scenario: History entry displays operation and timestamp
- **WHEN** a history entry is rendered
- **THEN** it displays the operation type (e.g., "CREATE", "UPDATE") and the formatted `changedAt` timestamp

### Requirement: History includes changed fields
The system SHALL display the values of key fields stored in each `BookEventEntry`.

#### Scenario: History entry shows title and authors
- **WHEN** a history entry is rendered
- **THEN** it displays the book title and resolved author names present in that entry

#### Scenario: History entry shows format and store
- **WHEN** a history entry is rendered
- **THEN** it displays the `format` and `store` values when present

> **Note:** Author history behavior is defined in [`author-history/spec.md`](../author-history/spec.md).
