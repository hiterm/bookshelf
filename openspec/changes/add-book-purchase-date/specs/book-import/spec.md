## MODIFIED Requirements

### Requirement: Kindle parsing remains separate from import conversion
The frontend SHALL parse each Kindle candidate with its raw `authorText` and
acquisition time, then add a timezone-safe calendar `purchaseDate` while
constructing `ImportBookInput`.

#### Scenario: Preserve an acquisition timestamp
- **WHEN** a Kindle candidate contains valid `acquiredTime`
- **THEN** parsing retains it as the candidate's purchase `Date`

#### Scenario: Convert an acquisition calendar date
- **WHEN** a candidate is converted in any supported browser timezone
- **THEN** its input contains the intended local calendar `purchaseDate`

### Requirement: Successful preview authorizes the matching import
After preview succeeds, the frontend SHALL display normalized fields including
backend `purchaseDate`, retain the exact preview input, and import that input.

#### Scenario: Display normalized purchase date
- **WHEN** preview returns a purchase date
- **THEN** that actual import date is displayed for the corresponding book

#### Scenario: Import previewed purchase date
- **WHEN** the user imports after successful preview
- **THEN** `importBooks` receives the retained input including `purchaseDate`
