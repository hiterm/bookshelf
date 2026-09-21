## ADDED Requirements

### Requirement: Runner speed claims use comparable CI measurements

The repository SHALL claim a unit-test runner CI speed improvement only after comparing its unit test job duration with a recent equivalent job on the previous runner. The comparison SHALL disclose material differences in environment, workflow, test discovery, or worker settings.

#### Scenario: A replacement runner has no CI measurement

- **WHEN** a runner experiment stops before a comparable CI run
- **THEN** its report states that a CI speed comparison is unavailable

#### Scenario: A replacement runner reaches CI

- **WHEN** a replacement runner's unit test job completes in CI
- **THEN** its duration and discovery counts are compared with an equivalent previous-runner job before claiming a speed improvement
