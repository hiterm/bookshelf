## MODIFIED Requirements

### Requirement: View author edit history
The system SHALL display the backend-provided list of Revisions for an author on the author detail page.

#### Scenario: Author detail page shows history
- **WHEN** user navigates to an author detail page
- **THEN** the page displays a "History" section containing all `authorRevisions` for that author in API order

#### Scenario: Author history entry identifies a revision
- **WHEN** an author history entry is rendered
- **THEN** it displays the revision number and formatted Revision creation timestamp

### Requirement: History includes changed fields
The system SHALL display the values of key fields stored in each `AuthorRevision`.

#### Scenario: History entry shows author name
- **WHEN** a history entry is rendered
- **THEN** it displays the author `name` present in that Revision

#### Scenario: History entry shows yomi
- **WHEN** a history entry is rendered
- **THEN** it displays the `yomi` value

#### Scenario: Restore an author revision
- **WHEN** a user confirms restoration from a selected author Revision
- **THEN** the frontend calls `restoreAuthor` with that Revision's `authorId` and `revisionNumber`
