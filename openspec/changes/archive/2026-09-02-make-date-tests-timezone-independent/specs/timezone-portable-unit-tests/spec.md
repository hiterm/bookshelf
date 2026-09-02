## ADDED Requirements

### Requirement: Local timestamp assertions are timezone-portable
Unit tests for timestamps that production formats in the runtime's local
timezone SHALL derive expected display text using that same local-time
formatting behavior instead of assuming a fixed UTC or JST wall-clock value.

#### Scenario: Unit tests run in UTC
- **WHEN** the unit test suite runs with `TZ=UTC`
- **THEN** locally formatted history timestamps match expectations and the unit
  tests pass

#### Scenario: Unit tests run in Asia/Tokyo
- **WHEN** the unit test suite runs with `TZ=Asia/Tokyo`
- **THEN** the same UTC fixture instants are expected as JST local display values
  and the unit tests pass

### Requirement: Production timezone behavior remains unchanged
The implementation SHALL preserve the existing production behavior of
formatting timestamps in the runtime's local timezone and SHALL NOT configure a
fixed timezone for the application or the overall test runner.

#### Scenario: Timestamp assertions become portable
- **WHEN** timezone-dependent timestamp assertions are corrected
- **THEN** only test code and OpenSpec artifacts change, with no production
  formatter, timezone plugin, or global runner timezone change
