## MODIFIED Requirements

### Requirement: Vitest coverage remains informational

The frontend CI SHALL upload its machine-readable Vitest coverage report to Codecov using the official `codecov/codecov-action`, and SHALL NOT enforce coverage percentage thresholds, persist a coverage workflow artifact, or generate an HTML coverage report.

#### Scenario: Coverage percentages are low

- **WHEN** unit tests pass but one or more reported coverage percentages are low
- **THEN** the unit-test job succeeds without a coverage-threshold failure

#### Scenario: Coverage reporting completes

- **WHEN** frontend CI finishes generating Vitest coverage
- **THEN** the machine-readable coverage report is uploaded to Codecov by the official Codecov action
- **AND** no coverage workflow artifact or HTML coverage report is generated

#### Scenario: Codecov upload fails

- **WHEN** the official Codecov action cannot upload the generated coverage report
- **THEN** the unit-test job fails at the upload step
