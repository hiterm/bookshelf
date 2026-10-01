## ADDED Requirements

### Requirement: Mutation reporting ownership

The UI that owns an application mutation operation SHALL report its failure through reportError exactly once per failed attempt. Shared mutation hooks and the application provider SHALL NOT also report that same mutation failure. Registration failures SHALL retain retry controls and entered form values.

#### Scenario: Author registration fails and is retried

- **WHEN** author registration rejects
- **THEN** one notification and one persistent error identify author registration, the entered name and reading remain available, and the user can retry
- **WHEN** the retry succeeds
- **THEN** no additional persistent error is added

#### Scenario: User registration fails and is retried

- **WHEN** user registration rejects
- **THEN** the rejection is handled, one notification and one persistent error identify user registration, and the registration button becomes available for retry

#### Scenario: Composed mutation fails

- **WHEN** author creation fails while saving a book
- **THEN** the owning book operation reports the failure once without an additional report from the shared author mutation hook

### Requirement: Safe local query error display

Local query error UI SHALL render a contextual label and a message produced by the shared safe normalizer. It MUST NOT serialize raw errors or log raw request-bearing query errors. Rendering local errors SHALL NOT create notifications or persistent entries.

#### Scenario: GraphQL query failure is displayed locally

- **WHEN** a blocking query fails with a ClientError containing request headers and variables
- **THEN** local error UI shows its contextual label and normalized response message without request headers or variables
- **AND** the existing persistent query reporting remains responsible for the single notification and persistent entry

#### Scenario: Unknown query failure is displayed locally

- **WHEN** a query error is an arbitrary object
- **THEN** local error UI uses the normalizer's stable generic message without serializing the object

#### Scenario: Failed query UI rerenders

- **WHEN** local query error UI rerenders with the same error
- **THEN** rendering creates no additional report or console output
