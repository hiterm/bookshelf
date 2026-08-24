# persistent-error-reporting Specification

## Purpose
TBD - created by archiving change persistent-error-display. Update Purpose after archive.
## Requirements
### Requirement: Centralized failure reporting
The frontend SHALL provide a single reporting operation that converts an unknown failure into an application error, retains it in memory, and emits a transient error notification.

#### Scenario: Mutation failure is reported through both channels
- **WHEN** an API or GraphQL mutation rejects with an error
- **THEN** the frontend displays a short error notification and adds one matching persistent error

#### Scenario: Successful operation remains unchanged
- **WHEN** an existing API or GraphQL mutation succeeds
- **THEN** its existing success notification behavior remains unchanged and no persistent error is added

#### Scenario: Validation failure remains local
- **WHEN** a form or imported file fails input validation before an API request
- **THEN** the frontend displays the existing field or screen-specific validation message and does not add a persistent application error

### Requirement: Persistent error lifecycle
The frontend SHALL retain every reported application error until the user dismisses it or reloads the page.

#### Scenario: Error survives notification timeout
- **WHEN** the transient notification expires
- **THEN** the corresponding error remains visible above the routed page content

#### Scenario: Error survives route navigation
- **WHEN** the user navigates to another frontend route after an error is reported
- **THEN** the persistent error remains available

#### Scenario: Reload clears errors
- **WHEN** the user reloads the browser page
- **THEN** the in-memory persistent error list starts empty

#### Scenario: Multiple errors are retained
- **WHEN** multiple failures are reported in one browser session
- **THEN** all failures remain visible in occurrence order without automatic eviction

### Requirement: Error inspection and dismissal
The frontend SHALL let keyboard and pointer users inspect, copy, and dismiss persistent errors using accessible controls.

#### Scenario: Details are expanded
- **WHEN** the user activates an error's details control
- **THEN** the frontend reveals its operation when present, normalized message, and technical details when present without breaking the page layout

#### Scenario: Details are copied
- **WHEN** the user activates an error's copy control and clipboard access succeeds
- **THEN** the clipboard receives issue-ready text containing title, optional operation, message, optional details, and an ISO occurrence timestamp

#### Scenario: Clipboard access fails
- **WHEN** clipboard access rejects
- **THEN** the frontend shows only transient copy-failure feedback and does not add another persistent error

#### Scenario: One error is dismissed
- **WHEN** the user activates one error's close control
- **THEN** only that error is removed

#### Scenario: All errors are dismissed
- **WHEN** more than one error exists and the user activates the all-dismiss control
- **THEN** every persistent error is removed

### Requirement: Safe error normalization
The frontend MUST normalize caught values without serializing full requests or arbitrary unknown object graphs and MUST exclude sensitive request data from display and clipboard details.

#### Scenario: Ordinary Error is normalized
- **WHEN** the caught value is a JavaScript `Error`
- **THEN** its primary message and available stack are retained

#### Scenario: GraphQL ClientError is normalized
- **WHEN** the caught value is a graphql-request `ClientError`
- **THEN** safe response status, GraphQL messages, paths, and sanitized extension values are retained

#### Scenario: Sensitive GraphQL data is excluded
- **WHEN** a GraphQL failure contains request headers, variables, credentials, cookies, tokens, or sensitive extension keys
- **THEN** those values are absent from displayed and copied details

#### Scenario: Unknown value is normalized
- **WHEN** the caught value is null, undefined, or an unrecognized object
- **THEN** the frontend uses a stable generic message without unrestricted serialization

### Requirement: Query failure reporting
The frontend SHALL report React Query failures persistently once per failed request while preserving screen-specific query error UI.

#### Scenario: Query transitions to error
- **WHEN** an application query transitions to an error state
- **THEN** the frontend adds one persistent query error and emits one transient error notification

#### Scenario: Error screen rerenders
- **WHEN** a component rerenders while the same query remains failed
- **THEN** the frontend does not add another persistent error solely because of that render

#### Scenario: Blocking query UI is retained
- **WHEN** a query failure prevents a screen from rendering meaningful content
- **THEN** the screen's local error state remains visible in addition to the shared persistent error

