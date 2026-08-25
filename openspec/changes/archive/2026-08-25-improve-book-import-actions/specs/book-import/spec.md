## ADDED Requirements

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
The frontend SHALL provide compact fixed Book Import actions that do not obscure page content, respect the AppShell content region and mobile bottom safe area, and preserve existing disabled and loading behavior during busy operations.

#### Scenario: Use the input editor on mobile
- **WHEN** the input editor is displayed below the desktop breakpoint with selected candidates
- **THEN** a viewport-bottom action displays `対象 N冊` and `プレビュー` while the settings form remains in normal document flow

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
