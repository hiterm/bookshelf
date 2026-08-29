# book-import Specification

## Purpose
Define a safe, configurable frontend workflow for parsing Kindle exporter data,
previewing the exact selected import inputs, and importing those retained inputs.
## Requirements
### Requirement: Candidate books remain editable before preview
The frontend SHALL provide `/books/import` as a directly accessible import page,
parse Kindle Bookshelf Exporter JSON from a file or explicitly loaded text,
retain raw candidate data, inclusive purchase-date display filtering, import
selection, per-book author splitting, and common settings, and enable preview
when at least one valid candidate is selected.

#### Scenario: File produces selectable candidates
- **WHEN** a valid Kindle JSON file is explicitly loaded
- **THEN** the candidate list is shown with every candidate selected and Preview enabled

#### Scenario: No visible selection
- **WHEN** no candidate is selected, regardless of the current display filter
- **THEN** Preview and Import are disabled

#### Scenario: Navigate from books
- **WHEN** a user activates the existing import action on `/books`
- **THEN** the frontend navigates to `/books/import` instead of opening a modal

#### Scenario: Open import route directly
- **WHEN** a user opens `/books/import` directly
- **THEN** the frontend displays a fresh input-and-settings step

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
filter, SHALL treat those candidates as the current import-eligible scope without
removing source candidates or changing their selected state, and visible
bulk-selection controls SHALL modify only currently visible candidates. Effective
import targets SHALL be the candidates in that scope that are also selected.

#### Scenario: Hide a selected candidate
- **WHEN** a purchase-date filter hides a selected candidate
- **THEN** the candidate remains selected but is not an effective import target

#### Scenario: Widen the purchase-date scope
- **WHEN** the purchase-date range is widened to show a previously hidden selected candidate
- **THEN** the candidate becomes an effective import target again without requiring reselection

#### Scenario: Clear visible selection
- **WHEN** the user activates `表示中をすべて解除`
- **THEN** visible candidates are deselected and hidden candidates retain their previous selection state

#### Scenario: Select visible candidates
- **WHEN** the user activates `表示中をすべて選択`
- **THEN** visible candidates are selected and hidden candidates retain their previous selection state

#### Scenario: Explain counts
- **WHEN** a filter and selection are active
- **THEN** the editor separately displays total, visible, and effective import-target counts

#### Scenario: Inclusive boundary
- **WHEN** a candidate purchase date equals the purchase-date threshold and the candidate is selected
- **THEN** the candidate is an effective import target

#### Scenario: Manual deselection within scope
- **WHEN** a candidate matches the purchase-date scope but is not selected
- **THEN** the candidate is not an effective import target

### Requirement: Preview uses current selected inputs
The frontend SHALL construct one `ImportBookInput[]` from every effective import
target using current per-book and common settings and SHALL pass that array once
to `previewBookImport`.

#### Scenario: Preview a filtered selection
- **WHEN** selected books exist both inside and outside the visible date range
- **THEN** `previewBookImport` receives only selected books inside the visible date range

#### Scenario: No purchase-date filter
- **WHEN** no purchase-date filter is specified
- **THEN** every selected candidate is eligible for Preview

#### Scenario: No selection
- **WHEN** no visible candidate is selected
- **THEN** Preview and Import remain disabled even if hidden candidates remain selected

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

#### Scenario: Re-preview unchanged input
- **WHEN** preview has succeeded and the user requests preview again without editing inputs
- **THEN** the frontend performs another preview and replaces the retained response and input only after success

### Requirement: Input changes invalidate preview
The frontend SHALL discard the preview response and retained preview input and
disable import whenever source candidates, effective import targets, per-book
author splitting, common settings, or the purchase-date filter change.

#### Scenario: Change individual selection
- **WHEN** a user changes an individual selection after returning from preview
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change all selections
- **WHEN** a user selects or clears visible candidates after returning from preview
- **THEN** preview is invalidated if the selected candidate IDs change

#### Scenario: Change purchase-date filter
- **WHEN** a user changes the purchase-date filter after returning from preview
- **THEN** retained selection remains unchanged and preview is invalidated

#### Scenario: Change or clear file
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

### Requirement: Successful import completes the existing workflow
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

### Requirement: Preview does not mutate cached or mock book state
Preview SHALL neither invalidate the books query nor mutate mock book storage;
only a successful import SHALL cause the existing books query invalidation and
mock import state transition.

#### Scenario: Preview completes in the application
- **WHEN** `previewBookImport` succeeds
- **THEN** the frontend does not invalidate the books query

#### Scenario: Preview completes against mocks
- **WHEN** the mock preview handler returns normalized books and author resolutions
- **THEN** the MockStore book state is unchanged

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

### Requirement: Visible candidates support bulk author splitting
The frontend SHALL provide controls that enable or disable comma-based author splitting for all currently visible candidates, SHALL leave hidden candidates' splitting state unchanged, and SHALL continue to permit per-candidate splitting changes after either bulk operation.

#### Scenario: Split all visible authors
- **WHEN** a user activates `表示中の著者をすべて分割`
- **THEN** comma splitting is enabled for every visible candidate and hidden candidates retain their previous splitting state

#### Scenario: Keep all visible authors unsplit
- **WHEN** a user activates `表示中の著者をすべて分割しない`
- **THEN** comma splitting is disabled for every visible candidate and hidden candidates retain their previous splitting state

#### Scenario: Override a bulk author setting
- **WHEN** a user changes one candidate's comma-splitting checkbox after a visible bulk operation
- **THEN** that candidate uses the individual setting while the other candidates retain the bulk setting

#### Scenario: Bulk author change invalidates preview
- **WHEN** a visible bulk author operation changes author interpretation after returning from preview
- **THEN** preview is invalidated and the next preview input contains author names derived from the updated splitting state

### Requirement: Primary import actions remain reachable in long workflows
The frontend SHALL provide compact fixed Book Import actions that do not obscure
page content, respect the AppShell content region and mobile bottom safe area,
display effective import-target counts, and preserve existing disabled and loading
behavior during busy operations.

#### Scenario: Use the input editor on mobile
- **WHEN** the input editor is displayed below the desktop breakpoint
- **THEN** the input source, common settings, filtering and bulk actions, and book list appear in that order while the non-fixed settings form remains in normal document flow and a viewport-bottom action displays the effective `対象 N冊` count and `プレビュー`

#### Scenario: Use the input editor on desktop
- **WHEN** the input editor is displayed at the desktop breakpoint
- **THEN** the existing 8:4 layout and sticky settings Preview action remain and the mobile fixed input action is not displayed

#### Scenario: Operate a long preview
- **WHEN** a preview containing N books is displayed at any supported viewport
- **THEN** viewport-bottom actions provide `入力・設定に戻る` and `N冊をインポート` without requiring scrolling to the final preview book

#### Scenario: Preview import is busy
- **WHEN** import is pending on the preview step
- **THEN** both fixed Back and Import actions are disabled and the Import action displays its loading state

#### Scenario: Fixed actions preserve content access
- **WHEN** a user scrolls to the end of an input or preview page that has a fixed action bar
- **THEN** reserved bottom space keeps the final normal-flow content visible above the bar
