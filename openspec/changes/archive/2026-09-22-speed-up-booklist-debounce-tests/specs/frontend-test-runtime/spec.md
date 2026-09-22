## ADDED Requirements

### Requirement: BookList debounce coverage uses focused timers

The frontend test suite SHALL verify the debounce primitive, the `StringFilter` 1000 ms behavior, and one complete BookList filter-to-Router path with fake timers. Ordinary BookList behavior tests SHALL avoid waiting for the production debounce in real time without weakening their existing table and Router assertions. Production APIs SHALL remain unchanged for test speed.

#### Scenario: Verify the debounce primitive

- **WHEN** dependencies change before the configured delay
- **THEN** the old timer is canceled and only the latest effect runs after the full delay

#### Scenario: Verify StringFilter timing

- **WHEN** a user changes a string input, including a second change during the debounce interval
- **THEN** the column filter remains unchanged before 1000 ms and receives only the latest value at 1000 ms

#### Scenario: Verify the integrated BookList path

- **WHEN** the title input changes in an unmocked BookList test
- **THEN** the table and Router search remain unchanged at 999 ms and both reflect the title filter at 1000 ms

#### Scenario: Verify ordinary BookList behavior

- **WHEN** the ordinary BookList tests run with an immediate debounce-hook mock
- **THEN** their filter, URL restoration, reset, sorting, pagination, and preset assertions still pass without real-time debounce waits

### Requirement: BookList test speed is evaluated in CI

The change SHALL report repeated local timing for the ordinary BookList test, the integrated debounce test, and the full Vitest suite, and SHALL compare CI timing with the previous baseline. Differences within ordinary runner variance SHALL not be presented as clear improvements.

#### Scenario: Evaluate the pull request

- **WHEN** the pull request validation runs
- **THEN** its recorded timing is compared with the previous 14.42 s BookList and 16.72 s full-suite CI measurements, including any lack of improvement
