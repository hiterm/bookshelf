## ADDED Requirements

### Requirement: Book authors link to author details
The system SHALL display every author name on a book detail page as an individual link to that author's detail page.

#### Scenario: Navigate to an author from a book detail
- **WHEN** a user selects an author name displayed on a book detail page
- **THEN** the system navigates to the detail page identified by that author's ID

#### Scenario: Display multiple linked authors
- **WHEN** a book has multiple authors
- **THEN** the system displays the authors in their existing order with comma-and-space separators and makes each author name independently navigable

### Requirement: Author readings remain informational
The system SHALL continue to display author readings separately from author-name links.

#### Scenario: Display author readings with linked names
- **WHEN** a book detail page displays linked author names
- **THEN** the author readings remain visible in their existing comma-separated format
