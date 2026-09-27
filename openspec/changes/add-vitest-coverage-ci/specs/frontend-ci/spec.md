## ADDED Requirements

### Requirement: Frontend CI reports detailed Vitest coverage

The frontend CI unit-test job SHALL collect coverage for maintained frontend source files and SHALL display a text report containing aggregate and per-file Statements, Branches, Functions, Lines, and uncovered line numbers in both the job log and the GitHub Actions step summary.

#### Scenario: Unit tests complete successfully in CI

- **WHEN** the frontend CI unit-test step completes successfully
- **THEN** its log contains the Vitest text coverage report
- **AND** the job summary contains the aggregate and per-file coverage table with uncovered line numbers

#### Scenario: A maintained source file is not loaded by any unit test

- **WHEN** a frontend application source file is eligible for coverage but is not loaded by the unit-test suite
- **THEN** the coverage report includes that file rather than omitting it from the report

### Requirement: Vitest coverage remains informational

The frontend CI SHALL NOT enforce coverage percentage thresholds and SHALL NOT upload coverage to an external service, persist a coverage artifact, or generate an HTML coverage report.

#### Scenario: Coverage percentages are low

- **WHEN** unit tests pass but one or more reported coverage percentages are low
- **THEN** the unit-test job succeeds without a coverage-threshold failure

#### Scenario: Coverage reporting completes

- **WHEN** frontend CI finishes reporting Vitest coverage
- **THEN** no coverage report is uploaded to an external service or workflow artifact
- **AND** no HTML coverage report is generated
