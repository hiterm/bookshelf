## MODIFIED Requirements

### Requirement: Candidate books remain editable before preview
The frontend SHALL provide `/books/import` as a directly accessible import page,
parse Kindle Bookshelf Exporter JSON from a file or explicitly loaded text,
retain raw candidate data, inclusive purchase-date display filtering, import
selection, per-book author splitting, and common settings, and enable preview
when at least one valid candidate is selected.

#### Scenario: Navigate from books
- **WHEN** a user activates the existing import action on `/books`
- **THEN** the frontend navigates to `/books/import` instead of opening a modal

#### Scenario: Open import route directly
- **WHEN** a user opens `/books/import` directly
- **THEN** the frontend displays a fresh input-and-settings step

#### Scenario: File produces selectable candidates
- **WHEN** a valid Kindle JSON file is explicitly loaded
- **THEN** the candidate list is shown with every candidate selected and Preview enabled

#### Scenario: Text produces equivalent candidates
- **WHEN** the same valid Kindle JSON string is explicitly loaded from the text input
- **THEN** the frontend produces the same candidates as file loading

#### Scenario: Switch source method
- **WHEN** parsed candidates exist and the user switches between file and text controls without loading a new source
- **THEN** the existing candidates and their settings remain unchanged

#### Scenario: Invalid source
- **WHEN** source text is invalid JSON or violates the Kindle exporter schema
- **THEN** the frontend displays a persistent local input error and installs no candidates from that source

#### Scenario: Stale file read
- **WHEN** an older file read finishes after a newer source-loading action
- **THEN** the older result does not replace the newer candidate state

### Requirement: Kindle parsing remains separate from import conversion
The frontend SHALL parse each Kindle candidate with an unmodified `authorText`
value and SHALL apply author interpretation and common book settings only while
constructing `ImportBookInput`.

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

### Requirement: Common import settings use editable Kindle-compatible defaults
The frontend SHALL initialize one common settings object with store `KINDLE`,
format `E_BOOK`, owned `true`, and priority `50`, allow the user to change each
typed value before preview, and apply those values to every selected input while
keeping ISBN empty.

#### Scenario: Display initial settings
- **WHEN** the import editor is opened
- **THEN** Kindle-compatible defaults are displayed for store, format, owned, and priority

#### Scenario: Preview edited settings
- **WHEN** the user changes store, format, owned, or priority and requests preview
- **THEN** every submitted input contains the edited common values

#### Scenario: Per-book common setting editing is unavailable
- **WHEN** candidates are displayed
- **THEN** store, format, owned, and priority can be edited only as common settings

### Requirement: Display filtering and import selection remain independent
The frontend SHALL derive visible candidates from the inclusive purchase-date
filter without removing source candidates or changing their selected state,
and visible bulk-selection controls SHALL modify only currently visible
candidates.

#### Scenario: Hide a selected candidate
- **WHEN** a purchase-date filter hides a selected candidate
- **THEN** the candidate remains selected and remains an import target

#### Scenario: Clear visible selection
- **WHEN** the user activates `表示中をすべて解除`
- **THEN** visible candidates are deselected and hidden candidates retain their previous selection state

#### Scenario: Select visible candidates
- **WHEN** the user activates `表示中をすべて選択`
- **THEN** visible candidates are selected and hidden candidates retain their previous selection state

#### Scenario: Explain counts
- **WHEN** a filter and selection are active
- **THEN** the editor separately displays total, visible, and import-target counts

### Requirement: Preview uses current selected inputs
The frontend SHALL construct one `ImportBookInput[]` from every selected
candidate using current per-book and common settings and SHALL pass that array
once to `previewBookImport`.

#### Scenario: Preview a filtered selection
- **WHEN** selected books exist both inside and outside the visible date range
- **THEN** `previewBookImport` receives all selected books regardless of visibility

#### Scenario: No selection
- **WHEN** no candidate is selected
- **THEN** Preview and Import remain disabled

#### Scenario: Duplicate preview request
- **WHEN** a preview request is already pending and the user attempts another preview
- **THEN** no second preview mutation is started

### Requirement: Successful preview authorizes the matching import
After preview succeeds, the frontend SHALL replace the editor with a preview
step at the same URL, display the normalized response and backend-derived author
summary, retain the exact input array used by preview, and enable import for
that retained input.

#### Scenario: Display normalized books
- **WHEN** preview succeeds with normalized book fields and author resolutions
- **THEN** the preview displays title, authors labeled existing or new, read, owned, priority, format, and store for each book

#### Scenario: Display preview summary
- **WHEN** preview succeeds
- **THEN** the preview displays the import book count and existing/new author counts derived from the response

#### Scenario: Return to editing
- **WHEN** the user activates `入力・設定に戻る`
- **THEN** the same URL displays the preserved editor state

#### Scenario: Import previewed input
- **WHEN** the user imports after a successful preview
- **THEN** `importBooks` receives the same `ImportBookInput[]` value retained from that preview without reconstructing it from UI state or response data

### Requirement: Input changes invalidate preview
The frontend SHALL discard the preview response and retained preview input and
disable import whenever source candidates, selection, per-book author splitting,
or common settings change; a display-filter change alone SHALL NOT invalidate
preview unless it is followed by a selection action that changes import targets.

#### Scenario: Change individual selection
- **WHEN** a user changes an individual selection after returning from preview
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change visible selections
- **WHEN** a user selects or clears visible candidates after returning from preview
- **THEN** preview is invalidated if the selected candidate IDs change

#### Scenario: Change purchase-date filter only
- **WHEN** a user changes a purchase-date filter without changing selection
- **THEN** retained selection is unchanged and the filter alone does not change import inputs

#### Scenario: Change source data
- **WHEN** a user successfully loads another file or text source after returning from preview
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change author splitting
- **WHEN** a user changes comma splitting for a candidate after returning from preview
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change common settings
- **WHEN** a user changes store, format, owned, or priority after returning from preview
- **THEN** preview is invalidated and import requires another successful preview

### Requirement: Mutation failures retain recoverable state
The frontend SHALL report preview and import failures through
`AppErrorProvider` while preserving the state needed to revise or retry the
operation.

#### Scenario: Preview fails
- **WHEN** `previewBookImport` fails
- **THEN** no preview result or preview input is retained, the editor state remains, and a persistent preview error is reported

#### Scenario: Import fails
- **WHEN** `importBooks` fails after preview succeeds
- **THEN** editor state, preview response, and preview input remain available and a persistent import error is reported

### Requirement: Successful import completes the page workflow
The frontend SHALL call `importBooks` only with retained successful-preview
input and, on success, show the existing success notification, invalidate the
books query, clear route-local import state, and navigate to `/books`.

#### Scenario: Import succeeds
- **WHEN** `importBooks` succeeds for retained preview input
- **THEN** success is reported, the books query is invalidated, and the frontend navigates to `/books`

#### Scenario: Import without successful preview
- **WHEN** no successful preview input is retained and import is attempted
- **THEN** no import mutation is started

#### Scenario: Duplicate import request
- **WHEN** an import request is already pending and the user attempts another import
- **THEN** no second import mutation is started

### Requirement: Busy operations prevent conflicting interaction
The frontend SHALL treat file reading, preview mutation, and import mutation as
busy operations and prevent source, settings, filter, selection, step, and
overlapping mutation interactions that could conflict with the active operation.

#### Scenario: Preview is pending
- **WHEN** `previewBookImport` is pending
- **THEN** all import-input-affecting controls and navigation between steps are disabled and neither preview nor import can be submitted again

#### Scenario: Import is pending
- **WHEN** `importBooks` is pending
- **THEN** all import-input-affecting controls and navigation between steps are disabled and neither preview nor import can be submitted again

### Requirement: Import editor remains usable for long lists
The frontend SHALL present a responsive single-page editor that uses separate
source/list and common-settings/action regions, keeps primary actions reachable
while scrolling long lists on wide viewports, and does not require horizontal
page scrolling on narrow viewports.

#### Scenario: Use a wide viewport
- **WHEN** the import editor is displayed at a desktop breakpoint
- **THEN** source and candidates occupy one column while a sticky common-settings and action region occupies another

#### Scenario: Use a narrow viewport
- **WHEN** the import editor is displayed below the desktop breakpoint
- **THEN** its regions stack into one column without requiring horizontal page scrolling
