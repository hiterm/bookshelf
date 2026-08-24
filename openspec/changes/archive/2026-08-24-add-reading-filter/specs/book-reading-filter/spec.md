## ADDED Requirements

### Requirement: Filter books by author reading
The book list SHALL provide a text filter for the author reading column and
SHALL display only books for which at least one associated author reading
contains the entered text.

#### Scenario: Filter by a partial reading
- **WHEN** a user enters part of an author's reading in the author reading filter
- **THEN** the list displays books with a matching author reading and excludes books without one

#### Scenario: Restore a reading filter from the URL
- **WHEN** the book list route contains an `authorYomis` column filter
- **THEN** the filter input and displayed books reflect that filter value

#### Scenario: Clear the reading filter
- **WHEN** a user clears the author reading filter
- **THEN** books are no longer excluded based on author reading

### Requirement: Sort books by author reading
The book list SHALL allow sorting by the author reading column and SHALL
preserve the selected sorting in the route search state.

#### Scenario: Sort by author reading
- **WHEN** a user activates sorting on the author reading column
- **THEN** the list orders books by the displayed author reading

#### Scenario: Restore author reading sorting from the URL
- **WHEN** the book list route contains sorting for `authorYomis`
- **THEN** the displayed books and sorting indicator reflect that sorting
