## ADDED Requirements

### Requirement: Runtime optimizations preserve regression detection

Frontend test runtime optimizations SHALL preserve existing behavioral assertions, completed asynchronous regression checks, test isolation, and distinct unit, mock-API, demo, and real-backend boundaries. Performance claims SHALL compare passing baseline and candidate runs under the same measurement conditions.

#### Scenario: Redistribute a slow component suite

- **WHEN** component scenarios are split into independently scheduled files
- **THEN** every existing scenario and assertion remains, each file retains isolation, and a paired full-suite measurement records elapsed time and passing test identity

#### Scenario: Evaluate an optimization

- **WHEN** a runtime optimization is proposed
- **THEN** its measurement conditions, individual results, limitations, and adoption or rejection rationale are recorded
