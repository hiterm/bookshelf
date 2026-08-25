# book-list-composition Specification

## Purpose
Define focused Book list responsibility boundaries while preserving existing
URL-backed table and presentation behavior.

## Requirements

### Requirement: Book list responsibility boundaries
The Book list implementation SHALL keep Book-specific columns, URL-backed
table state synchronization, toolbar controls, table rendering, and pagination
in focused Book feature modules, while `BookList` SHALL create the table once
and compose those modules.

#### Scenario: Book list composition
- **WHEN** the Book list is rendered
- **THEN** `BookList` creates one table instance from Book data, Book columns,
  and URL-backed state and passes that instance to the presentation components

#### Scenario: Feature-specific implementation
- **WHEN** Book column or search synchronization behavior is maintained
- **THEN** the implementation remains within the Book feature and does not
  introduce a generic table abstraction

### Requirement: URL remains the table state source of truth
The Book list SHALL derive column filters, sorting, page index, and page size
from Router search state and SHALL update that search state through replace
navigation after valid table changes.

#### Scenario: Filter or sorting update
- **WHEN** a valid column-filter or sorting update changes the controlled state
- **THEN** the corresponding URL search value is updated and page index is
  omitted so pagination resets to the first page

#### Scenario: Empty filter or sorting update
- **WHEN** column filters or sorting become empty
- **THEN** the corresponding value is omitted from URL search

#### Scenario: Pagination update
- **WHEN** page index or page size changes
- **THEN** page index zero and page size 20 are omitted while page sizes 50 and
  100 are retained in URL search

#### Scenario: Invalid state update
- **WHEN** a column-filter or sorting update fails schema validation
- **THEN** no navigation is performed

### Requirement: Existing Book list behavior is preserved
The refactored Book list MUST preserve its existing columns, cell content,
filtering, sorting, pagination, preset, reset, and column-visibility behavior.

#### Scenario: Unread-owned preset
- **WHEN** the unread-owned preset is applied
- **THEN** unread and owned filters are set, priority is sorted descending, and
  page index resets

#### Scenario: Reset search
- **WHEN** the reset control is activated
- **THEN** Router search is replaced with an empty search object

#### Scenario: Table presentation
- **WHEN** the Book table and controls are rendered
- **THEN** the existing eleven columns, filter controls, sorting controls,
  visibility controls, pagination, and page-size choices 20, 50, and 100 remain
  available with unchanged behavior
