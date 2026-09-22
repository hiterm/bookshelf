## Why

The unit and component test suite is a material part of CI time. Rstest might reduce that time, so this change evaluated compatibility and performance before deciding whether to replace Vitest. The experiment did not establish a worthwhile CI improvement and Vitest 5 remains the supported runner.

## What Changes

- Record the Vitest baseline and trial Rstest with the same unit/component test scope.
- Check discovery, assertions, mocks, setup, jsdom, global APIs, exclusions, and local performance.
- Document the failed TypeScript compatibility gate and the lack of a comparable Rstest CI result.
- Keep Vitest 5 and Playwright E2E unchanged after the trial.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `frontend-test-runtime`: Require parity and CI performance evidence before adopting a replacement runner; retain Vitest when evidence is insufficient.
- `frontend-ci`: Require a comparable CI measurement before claiming a runner speed improvement.

## Impact

The committed change documents the experiment and its adoption decision. Test scripts, configuration, setup, dependencies, production code, and Playwright E2E remain unchanged.
