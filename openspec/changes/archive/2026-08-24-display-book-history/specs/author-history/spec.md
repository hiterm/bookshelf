## ADDED Requirements

### Requirement: View author edit history
The system SHALL display a chronological list of edit events for an author on the author detail page.

#### Scenario: Author detail page shows history
- **WHEN** user navigates to an author detail page
- **THEN** the page displays a "History" section containing all `authorEvents` for that author, ordered by `changedAt` descending

#### Scenario: Author history entry displays operation and timestamp
- **WHEN** an author history entry is rendered
- **THEN** it displays the operation type and the formatted `changedAt` timestamp

### Requirement: History includes changed fields
The system SHALL display the values of key fields stored in each `AuthorEventEntry`.

#### Scenario: History entry shows author name
- **WHEN** a history entry is rendered
- **THEN** it displays the author `name` present in that entry

#### Scenario: History entry shows yomi
- **WHEN** a history entry is rendered
- **THEN** it displays the `yomi` value when present
