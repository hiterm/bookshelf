## ADDED Requirements

### Requirement: Runner migration is evaluated with comparable CI timing

The repository SHALL compare the unit test job duration for Rstest with a recent equivalent Vitest job before claiming a CI speed improvement. The comparison SHALL record test file and case counts and disclose material differences in environment, workflow, or worker settings.

#### Scenario: Evaluate a runner migration pull request

- **WHEN** the pull request's unit test job completes
- **THEN** its duration and discovery counts are compared with a Vitest-based CI run
- **AND** the pull request reports whether the measured result supports adoption
