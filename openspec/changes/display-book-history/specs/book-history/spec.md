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

### Requirement: View author edit history
The system SHALL display a chronological list of edit events for an author on the author detail page.

#### Scenario: Author detail page shows history
- **WHEN** user navigates to an author detail page
- **THEN** the page displays a "History" section containing all `authorEvents` for that author, ordered by `changedAt` descending

#### Scenario: Author history entry displays operation and timestamp
- **WHEN** an author history entry is rendered
- **THEN** it displays the operation type and the formatted `changedAt` timestamp
