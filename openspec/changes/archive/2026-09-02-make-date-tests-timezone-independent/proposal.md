## Why

History component unit tests currently hard-code UTC-formatted timestamps even
though production intentionally formats instants in the runtime's local time.
This makes otherwise-correct tests fail in non-UTC environments such as JST.

## What Changes

- Make timestamp assertions derive their expected text in the test process's
  local timezone.
- Share the test-only formatting logic instead of duplicating it across history
  component tests.
- Verify the unit suite in both UTC and Asia/Tokyo without fixing the runner or
  production display to either timezone.

## Capabilities

### New Capabilities

- `timezone-portable-unit-tests`: Unit tests for locally formatted timestamps
  remain valid across supported host timezones.

### Modified Capabilities

None.

## Impact

The change is limited to frontend unit tests and a test utility. Production
date formatting, runtime dependencies, Kindle import behavior, and integration
tests are unaffected.
