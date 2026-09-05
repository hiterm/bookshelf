## ADDED Requirements

### Requirement: Books expose an optional calendar purchase date
The frontend SHALL create, update, query, and display a nullable `purchaseDate`
GraphQL `Date` without interpreting that date-only value as a timestamp.

#### Scenario: Create with a purchase date
- **WHEN** a user enters a purchase date while creating a book
- **THEN** `createBook` receives that `YYYY-MM-DD` value

#### Scenario: Create without a purchase date
- **WHEN** a user leaves the purchase date empty while creating a book
- **THEN** `createBook` receives `purchaseDate: null`

#### Scenario: Clear a purchase date
- **WHEN** a user removes the purchase date while editing a book
- **THEN** the full update input contains `purchaseDate: null`

#### Scenario: Display a purchase date
- **WHEN** a book has a purchase date
- **THEN** detail displays it without timezone drift

### Requirement: Book lists support purchase-date discovery
The frontend SHALL expose a purchase-date column with two-way sorting and
inclusive from/to filtering through existing table and URL state.

#### Scenario: Sort purchase dates
- **WHEN** the user toggles purchase-date sorting
- **THEN** rows are ordered in the selected direction with nulls supported

#### Scenario: Filter an inclusive range
- **WHEN** purchase-date From and To values are present
- **THEN** only books within both inclusive bounds are shown

#### Scenario: Filter a single date
- **WHEN** From and To contain the same date
- **THEN** books purchased on that date are shown

#### Scenario: Restore filters from URL
- **WHEN** the route opens with purchase-date bounds in its query string
- **THEN** validated search and visible filters reflect those bounds
