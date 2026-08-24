## ADDED Requirements

### Requirement: Browse operation-oriented change history
The system SHALL provide an authenticated change-history page at `/history` that displays API-provided EventSets in their existing newest-first order as accessible navigation items.

#### Scenario: History list shows operations
- **WHEN** a user opens `/history` and EventSets exist
- **THEN** each item displays the operation's user-facing label and the locally formatted creation time
- **AND** the EventSet identifier is not shown as ordinary page content

#### Scenario: User opens a history detail
- **WHEN** a user activates an EventSet item with a pointer or keyboard
- **THEN** the system navigates to `/history/$eventSetId` for that EventSet

#### Scenario: History is empty
- **WHEN** the EventSet query returns no entries
- **THEN** the page displays a Japanese empty-state message

#### Scenario: History query is pending or fails
- **WHEN** the EventSet query is pending or returns an error
- **THEN** the page displays a loading indicator or an error message respectively

### Requirement: Change history is available from primary navigation
The system SHALL expose the change-history page in the Navbar using the user-facing label "変更履歴" after the book and author destinations.

#### Scenario: User follows history navigation
- **WHEN** a user activates "変更履歴" in the Navbar
- **THEN** the system navigates to `/history`

### Requirement: Operations remain readable as the API evolves
The system SHALL map known EventSet and event operation strings to user-facing Japanese labels and SHALL display an unknown operation's raw string value as a fallback.

#### Scenario: Known operation is displayed
- **WHEN** an EventSet has a known operation such as `create_book`
- **THEN** the UI displays the corresponding Japanese label such as "書籍を追加"

#### Scenario: Unknown operation is displayed
- **WHEN** an EventSet or event has an operation not known to the frontend
- **THEN** the UI displays that operation string without throwing an error

### Requirement: Inspect events grouped by logical operation
The system SHALL provide an EventSet detail page at `/history/$eventSetId` that displays the EventSet operation and local creation time and separates its BookEvents from its AuthorEvents.

#### Scenario: Detail contains book and author events
- **WHEN** a resolved EventSet contains both BookEvents and AuthorEvents
- **THEN** the page displays distinct "書籍" and "著者" sections with their respective events

#### Scenario: Detail contains only one event kind
- **WHEN** a resolved EventSet contains only BookEvents or only AuthorEvents
- **THEN** the page displays the populated event section without requiring the other kind

#### Scenario: EventSet does not exist
- **WHEN** `eventSet(id)` returns null
- **THEN** the page displays "変更履歴が見つかりません" without raising a JavaScript error
- **AND** provides a route back to the history list

#### Scenario: Detail query is pending or fails
- **WHEN** the EventSet detail query is pending or returns an error
- **THEN** the page displays a loading indicator or an error message respectively

### Requirement: Event snapshots are disclosed on demand
The system SHALL render each BookEvent and AuthorEvent as a collapsed-by-default accessible disclosure whose summary identifies the event operation and affected entity.

#### Scenario: Events are initially collapsed
- **WHEN** an EventSet detail containing one or many events is first displayed
- **THEN** none of the event snapshot panels are expanded

#### Scenario: Book event is expanded
- **WHEN** a user expands a BookEvent
- **THEN** the UI displays title, author IDs, ISBN, read, owned, priority, format, store, book creation time, book update time, and change time

#### Scenario: Author event is expanded
- **WHEN** a user expands an AuthorEvent
- **THEN** the UI displays name, reading, author creation time, author update time, and change time

#### Scenario: Snapshot labels are absent
- **WHEN** a BookEvent title or AuthorEvent name is null
- **THEN** its summary uses the corresponding entity identifier as the fallback label

#### Scenario: Snapshot fields are null
- **WHEN** a displayed snapshot field is null or undefined
- **THEN** the UI displays a consistent placeholder instead of the literal text `null` or failing

### Requirement: Extra event data is secondary and schema-independent
The system SHALL omit null `extra` values and SHALL expose non-null `extra` data separately from primary snapshot fields as readable, formatted JSON.

#### Scenario: Event has no extra data
- **WHEN** an event's `extra` value is null
- **THEN** no "追加情報" disclosure is displayed for that event

#### Scenario: Event has extra data
- **WHEN** an event's `extra` value is non-null
- **THEN** the user can expand "追加情報" and inspect pretty-printed JSON without an operation-specific renderer
