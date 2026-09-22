## Why

`BookList.test.tsx` is the critical path of the Vitest suite. Several string-filter tests wait for the same 1000 ms debounce in real time, even though most of their assertions concern table and Router behavior rather than the delay itself.

## What Changes

- Verify the debounce primitive and `StringFilter` timing with fake timers.
- Run the ordinary BookList behavior tests with an immediate `useDebouncedEffect` mock, while retaining all existing cases and assertions.
- Keep one BookList integration test with the real debounce and fake timers to cover the path through the table and Router.
- Compare repeated local measurements and CI measurements against the existing 14.42 s BookList and 16.72 s full-suite baselines. Record results even if the change does not improve CI time.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-test-runtime`: Define focused debounce coverage and measurement expectations for the BookList tests.

## Impact

Only Vitest tests and OpenSpec documentation change. Production code, public component APIs, dependencies, and shared test concurrency remain unchanged.
