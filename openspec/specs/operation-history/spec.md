## Purpose

Define the user-facing change history that groups book and author revision changes by the backend Operation that produced them.

## Requirements

### Requirement: Browse operation change history
The system SHALL provide an authenticated change-history page at `/history` that displays API-provided Operations in their existing newest-first order as accessible navigation items.

#### Scenario: History list shows operations
- **WHEN** a user opens `/history` and Operations exist
- **THEN** each item displays the operation type's user-facing label and the locally formatted creation time
- **AND** the Operation identifier is not shown as ordinary page content

#### Scenario: User opens an operation detail
- **WHEN** a user activates an Operation item with a pointer or keyboard
- **THEN** the system navigates to `/history/$operationId` for that Operation

#### Scenario: History is empty
- **WHEN** the Operations query returns no entries
- **THEN** the page displays a Japanese empty-state message

#### Scenario: History query is pending or fails
- **WHEN** the Operations query is pending or returns an error
- **THEN** the page displays a loading indicator or an error message respectively

### Requirement: Operation history remains available from primary navigation
The system SHALL expose the change-history page in the Navbar using the user-facing label "変更履歴" after the book and author destinations.

#### Scenario: User follows history navigation
- **WHEN** a user activates "変更履歴" in the Navbar
- **THEN** the system navigates to `/history`

### Requirement: Operation types remain readable as the API evolves
The system SHALL map known Operation type strings to user-facing Japanese labels and SHALL display an unknown type's raw string value as a fallback.

#### Scenario: Known operation type is displayed
- **WHEN** an Operation has a known type such as `create_book`
- **THEN** the UI displays the corresponding Japanese label such as "書籍を追加"

#### Scenario: Unknown operation type is displayed
- **WHEN** an Operation has a type not known to the frontend
- **THEN** the UI displays that type string without throwing an error

### Requirement: Inspect revisions grouped by operation
The system SHALL provide an Operation detail page at `/history/$operationId` that displays its type, detail, local creation time, book changes, and author changes using before and after Revisions.

#### Scenario: Detail contains book and author changes
- **WHEN** a resolved Operation contains both book changes and author changes
- **THEN** the page displays distinct "書籍" and "著者" sections with their respective changes

#### Scenario: Operation change is expanded
- **WHEN** a user expands a book or author change
- **THEN** the UI displays the available before and after Revision snapshots and their revision numbers

#### Scenario: Detail data is present
- **WHEN** an Operation has non-null `detail`
- **THEN** the user can inspect its readable formatted JSON separately from primary revision fields

#### Scenario: Operation does not exist
- **WHEN** `operation(id)` returns null
- **THEN** the page displays "変更履歴が見つかりません" and provides a route back to the history list

#### Scenario: Detail query is pending or fails
- **WHEN** the Operation detail query is pending or returns an error
- **THEN** the page displays a loading indicator or an error message respectively
