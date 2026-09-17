## ADDED Requirements

### Requirement: Normal builds retain Vite checker validation
The normal application build SHALL continue to register
`vite-plugin-checker`, and the standalone typecheck command SHALL remain
unchanged.

#### Scenario: Developer runs the normal build
- **WHEN** a developer runs `pnpm build`
- **THEN** the Vite build runs with `vite-plugin-checker` enabled

#### Scenario: Developer runs standalone type checking
- **WHEN** a developer runs `pnpm typecheck`
- **THEN** the existing standalone typecheck command performs validation

### Requirement: Dedicated build can omit Vite checker validation
The project SHALL provide a `build:without-check` package script that disables
`vite-plugin-checker` through an internal non-`VITE_` environment variable.

#### Scenario: Developer runs the checker-free build
- **WHEN** a developer runs `pnpm build:without-check`
- **THEN** the Vite build succeeds without registering `vite-plugin-checker`

### Requirement: Vitest retains its checker exclusion
Vite SHALL continue to omit `vite-plugin-checker` while Vitest is running.

#### Scenario: Vitest evaluates the Vite configuration
- **WHEN** `process.env.VITEST` equals `"true"`
- **THEN** `vite-plugin-checker` is not registered

### Requirement: Every Playwright suite uses the checker-free build command
The mock API, demo mode, and integration Playwright web servers SHALL build the
application through `build:without-check` and SHALL NOT contain the internal
checker environment variable in their configuration.

#### Scenario: Mock API Playwright starts its web server
- **WHEN** the mock API Playwright configuration starts a web server
- **THEN** it invokes `build:without-check` before preview

#### Scenario: Demo mode Playwright starts its web server
- **WHEN** the demo mode Playwright configuration starts a web server
- **THEN** it invokes `build:without-check` before preview

#### Scenario: Integration Playwright starts its web server
- **WHEN** the integration Playwright configuration starts a web server
- **THEN** it invokes `build:without-check` before preview
