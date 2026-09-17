## ADDED Requirements

### Requirement: View book edit history
The system SHALL display a newest-first (changedAt descending) list of edit events for a book on the book detail page.

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

### Requirement: History entry shows ISBN, read, owned, and priority
The system SHALL display ISBN, read status, owned status, and priority in each `BookEventEntry` row, and provide a detail modal on row click.

#### Scenario: History row displays ISBN, read, owned, and priority
- **WHEN** a history entry is rendered
- **THEN** it displays the `isbn`, `read` (read status flag), `owned` (owned status flag), and `priority` values when present

#### Scenario: Row click opens detail modal
- **WHEN** user clicks a history row
- **THEN** a detail modal opens showing all saved fields of the `BookEventEntry` with change diffs highlighted

> **Note:** Author history behavior is defined in [`author-history/spec.md`](../author-history/spec.md).
