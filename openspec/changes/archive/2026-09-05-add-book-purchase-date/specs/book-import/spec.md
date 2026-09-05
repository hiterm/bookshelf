## MODIFIED Requirements

### Requirement: Kindle parsing remains separate from import conversion
The frontend SHALL parse each Kindle candidate with an unmodified `authorText`
value and acquisition time and SHALL apply author interpretation, common book
settings, and a timezone-safe calendar `purchaseDate` only while constructing
`ImportBookInput`.

#### Scenario: Parse an author containing a comma
- **WHEN** a Kindle item contains the author text `Smith, John`
- **THEN** the parsed candidate retains `Smith, John` as one raw string

#### Scenario: Keep an author unsplit
- **WHEN** comma splitting is disabled for a candidate
- **THEN** its input author names contain the trimmed complete author text as one name

#### Scenario: Split an author by comma
- **WHEN** comma splitting is enabled for author text `山田太郎, 鈴木花子`
- **THEN** its input author names are `山田太郎` and `鈴木花子` in source order

#### Scenario: Normalize split author segments
- **WHEN** enabled comma splitting produces whitespace-only segments
- **THEN** the frontend trims all segments, removes empty segments, does not mutate the source candidate, and rejects a result with no author names

#### Scenario: Preserve an acquisition timestamp
- **WHEN** a Kindle candidate contains valid `acquiredTime`
- **THEN** parsing retains it as the candidate's purchase `Date`

#### Scenario: Convert an acquisition calendar date
- **WHEN** a candidate is converted in any supported browser timezone
- **THEN** its input contains the intended local calendar `purchaseDate`

### Requirement: Successful preview authorizes the matching import
After preview succeeds, the frontend SHALL replace the editor with a preview
step at the same URL, display normalized fields including backend
`purchaseDate` and the author summary, retain the exact input array used by
preview, and enable import for that retained input.

#### Scenario: Display normalized books
- **WHEN** preview succeeds with normalized book fields and author resolutions
- **THEN** the preview displays title, authors labeled existing or new, read, owned, priority, format, store, and purchase date for each book

#### Scenario: Display preview summary
- **WHEN** preview succeeds
- **THEN** the preview displays the import book count and existing/new author counts derived from the response

#### Scenario: Return to editing
- **WHEN** the user activates `入力・設定に戻る`
- **THEN** the same URL displays the preserved editor state

#### Scenario: Import previewed input
- **WHEN** the user imports after a successful preview
- **THEN** `importBooks` receives the same `ImportBookInput[]` value, including `purchaseDate`, retained from that preview without reconstruction

#### Scenario: Re-preview unchanged input
- **WHEN** preview has succeeded and the user requests preview again without editing inputs
- **THEN** the frontend performs another preview and replaces the retained response and input only after success

#### Scenario: Display normalized purchase date
- **WHEN** preview returns a purchase date
- **THEN** that actual import date is displayed for the corresponding book

#### Scenario: Import previewed purchase date
- **WHEN** the user imports after successful preview
- **THEN** `importBooks` receives the retained input including `purchaseDate`
