# book-import Specification

## Purpose
TBD - created by archiving change use-book-import-preview. Update Purpose after archive.
## Requirements
### Requirement: Candidate books remain editable before preview
The frontend SHALL parse selected Kindle JSON, retain inclusive purchase-date
filtering and book selection, enable preview when at least one selected book is
visible, and keep import disabled until preview succeeds.

#### Scenario: File produces selectable candidates
- **WHEN** a valid Kindle JSON file is loaded and at least one visible candidate is selected
- **THEN** the candidate list is shown with Preview enabled and Import disabled

#### Scenario: No visible selection
- **WHEN** no selected candidate is visible under the current date filter
- **THEN** both Preview and Import are disabled

### Requirement: Preview uses current selected visible inputs
The frontend SHALL generate one `ImportBookInput[]` from candidates that are
both selected and visible and SHALL pass that array to `previewBookImport`.

#### Scenario: Preview a filtered selection
- **WHEN** the user requests preview with selected books both inside and outside the visible date range
- **THEN** `previewBookImport` receives only selected books inside the visible date range

#### Scenario: Duplicate preview request
- **WHEN** a preview request is already pending and the user attempts another preview
- **THEN** no second preview mutation is started

### Requirement: Successful preview authorizes the matching import
After preview succeeds, the frontend SHALL display the normalized preview
response, retain the exact input array used by preview, and enable import for
that retained input.

#### Scenario: Display normalized books
- **WHEN** preview succeeds with normalized book fields and author resolutions
- **THEN** a distinct import-content section displays the normalized books and labels every author as existing or new

#### Scenario: Import previewed input
- **WHEN** the user imports after a successful preview
- **THEN** `importBooks` receives the same `ImportBookInput[]` value retained from that preview without reconstructing it from UI state or response data

#### Scenario: Re-preview unchanged input
- **WHEN** preview has succeeded and the user requests preview again without editing inputs
- **THEN** the frontend performs another preview and replaces the retained response and input only after success

### Requirement: Input changes invalidate preview
The frontend SHALL discard the preview response and retained preview input and
disable import whenever an import-input-affecting state changes.

#### Scenario: Change individual selection
- **WHEN** a user changes an individual checkbox after preview succeeds
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change all selections
- **WHEN** a user selects all or clears all after preview succeeds
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change purchase-date filter
- **WHEN** a user changes either purchase-date condition after preview succeeds
- **THEN** preview is invalidated and import requires another successful preview

#### Scenario: Change or clear file
- **WHEN** a user selects another file or clears the current file after preview succeeds
- **THEN** preview is invalidated and import requires another successful preview

### Requirement: Mutation failures retain recoverable state
The frontend SHALL report preview and import failures through
`AppErrorProvider` while preserving the state needed to revise or retry the
operation.

#### Scenario: Preview fails
- **WHEN** `previewBookImport` fails
- **THEN** no preview result or preview input is retained, Import stays disabled, the candidate file/filter/selection state remains, and a persistent preview error is reported

#### Scenario: Import fails
- **WHEN** `importBooks` fails after preview succeeds
- **THEN** candidate state, preview response, and preview input remain available and a persistent import error is reported

### Requirement: Successful import completes the existing workflow
The frontend SHALL call `importBooks` only with retained successful-preview
input and, on success, show the existing success notification, invalidate the
books query, reset dialog state, and close the dialog.

#### Scenario: Import succeeds
- **WHEN** `importBooks` succeeds for retained preview input
- **THEN** success is reported, the books query is invalidated, dialog state is reset, and the dialog closes

#### Scenario: Import without successful preview
- **WHEN** no successful preview input is retained and import is attempted
- **THEN** no import mutation is started

#### Scenario: Duplicate import request
- **WHEN** an import request is already pending and the user attempts another import
- **THEN** no second import mutation is started

### Requirement: Busy operations prevent conflicting interaction
The frontend SHALL treat file reading, preview mutation, and import mutation as
busy operations and prevent closing, file changes, filter changes, selection
changes, and overlapping mutations while busy.

#### Scenario: Preview is pending
- **WHEN** `previewBookImport` is pending
- **THEN** close and all input-affecting controls are disabled and neither preview nor import can be submitted again

#### Scenario: Import is pending
- **WHEN** `importBooks` is pending
- **THEN** close and all input-affecting controls are disabled and neither preview nor import can be submitted again

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

