## Purpose

Preserve TanStack Router automatic code splitting by defining how route files
expose runtime route values and where directly imported route components live.

## Requirements

### Requirement: Code-splittable route values are not exported
The frontend SHALL avoid exporting runtime values used by code-splittable route
properties, including `component`, from the same TanStack Router route file.

#### Scenario: Route component is local to its route
- **WHEN** a route component is used only by its route definition
- **THEN** the route file keeps the component as a non-exported local value

#### Scenario: Route component requires a direct import
- **WHEN** tests or another module must directly import a route component
- **THEN** the component is defined in a non-route file and imported by the route file without being re-exported from it

### Requirement: Current route files are free of blocking exports
The frontend SHALL inspect all current files under `src/routes/` for local
runtime values that are both used by code-splittable route properties and
exported from the same route file.

#### Scenario: Route-file review completes
- **WHEN** the current route tree is reviewed
- **THEN** every matching export is removed or moved to a non-route file

### Requirement: Test execution reports no code-splitting export warning
The frontend test suite SHALL run without the TanStack Router warning that
route-file exports will not be code-split and will increase bundle size.

#### Scenario: Focused history tests run
- **WHEN** the history route unit tests are executed after the change
- **THEN** stderr does not contain `[tanstack-router] These exports ... will not be code-split`

#### Scenario: Full unit test suite runs
- **WHEN** the full unit test suite is executed after the change
- **THEN** no route file produces the same TanStack Router code-splitting warning

### Requirement: Routing convention is documented
The repository SHALL document the route-file automatic-code-splitting
convention in `docs/architecture/routing.md` and SHALL link that document from
the architecture documentation guidance in `AGENTS.md`.

#### Scenario: Contributor reviews routing guidance
- **WHEN** a contributor plans an architectural, structural, or routing change
- **THEN** repository guidance directs them to the relevant durable documentation under `docs/architecture/`
