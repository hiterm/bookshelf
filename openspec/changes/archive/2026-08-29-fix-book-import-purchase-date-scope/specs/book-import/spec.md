## MODIFIED Requirements

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
