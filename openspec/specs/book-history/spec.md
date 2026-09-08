# book-history Specification

## Purpose
Define book Revision history displayed on the book detail page.
## Requirements
### Requirement: View book edit history
The system SHALL display the backend-provided list of Revisions for a book on the book detail page.

#### Scenario: Book detail page shows history
- **WHEN** user navigates to a book detail page
- **THEN** the page displays a "History" section containing all `bookRevisions` for that book in API order

#### Scenario: History entry identifies a revision
- **WHEN** a history entry is rendered
- **THEN** it displays the revision number and formatted Revision creation timestamp

### Requirement: History includes changed fields
The system SHALL display the values of key fields stored in each `BookRevision`.

#### Scenario: History entry shows title and authors
- **WHEN** a history entry is rendered
- **THEN** it displays the book title and resolved author names present in that Revision

#### Scenario: History entry shows format and store
- **WHEN** a history entry is rendered
- **THEN** it displays the `format` and `store` values

### Requirement: History entry shows ISBN, read, owned, and priority
The system SHALL display ISBN, read status, owned status, and priority in each `BookRevision` row, and provide the existing detail interaction.

#### Scenario: History row displays ISBN, read, owned, and priority
- **WHEN** a history entry is rendered
- **THEN** it displays the `isbn`, `read`, `owned`, and `priority` values

#### Scenario: Restore a book revision
- **WHEN** a user confirms restoration from a selected book Revision
- **THEN** the frontend calls `restoreBook` with that Revision's `bookId` and `revisionNumber`

### Requirement: Book revisions display purchase dates
The frontend SHALL query and display the nullable purchase date captured by each
book revision and operation-history snapshot.

#### Scenario: View a dated revision
- **WHEN** a historical revision contains a purchase date
- **THEN** the revision view displays that calendar date

#### Scenario: View a revision without a purchase date
- **WHEN** a historical revision has no purchase date
- **THEN** the existing optional-value placeholder is displayed
