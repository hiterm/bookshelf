## Why

Playwright currently rebuilds the application with `vite-plugin-checker`, even
though type checking is already covered separately. Skipping the redundant
checker reduces the provided benchmark from 15.46 seconds to 4.24 seconds
(a reported 11.23 seconds, or 72.6%, faster) while preserving normal
validation. These independently rounded figures come from the benchmark that
motivated the change; implementation verification uses a separate local run.

## What Changes

- Add a dedicated `build:without-check` command that omits
  `vite-plugin-checker` through an internal, non-`VITE_` environment variable.
- Use the dedicated command for mock API, demo mode, and integration Playwright
  web server builds.
- Keep checker behavior unchanged for normal builds, explicit type checking,
  and Vitest's existing checker exclusion.

## Capabilities

### New Capabilities

- `playwright-build-validation`: Defines checker behavior for normal, Vitest,
  and all Playwright build paths.

### Modified Capabilities

None.

## Impact

The change affects `vite.config.ts`, package scripts, and all three Playwright
configuration files. It changes no runtime API and adds no dependency.
