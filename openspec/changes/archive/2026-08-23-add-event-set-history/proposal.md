## Why

Existing history views explain how one book or author changed, but they do not show the complete set of changes produced by one logical user operation. Exposing the API's EventSet queries gives users an operation-oriented audit trail without replacing the existing entity history.

## What Changes

- Add a "変更履歴" navigation item and an EventSet history list at `/history`.
- Add an EventSet detail page at `/history/$eventSetId` that separates book and author events and keeps event snapshots collapsed until requested.
- Present known operations with Japanese labels while safely falling back to unknown operation values.
- Display nullable snapshot fields consistently and expose non-null `extra` data in a separate, collapsible JSON view.
- Add GraphQL operations, query hooks, generated mocks, unit/component tests, and E2E coverage for mock API, Demo Mode, and real-backend integration flows.
- Keep existing entity history views unchanged; pagination, filtering, restoring, deleting, and editing EventSets are outside this change.

## Capabilities

### New Capabilities
- `event-set-history`: Browse logical-operation history and inspect the book and author events grouped within an EventSet.

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- Adds EventSet GraphQL documents and regenerates request types, SDK helpers, MSW helpers, and the TanStack route tree.
- Adds history hooks, routes, feature components, operation-label helpers, and Navbar navigation.
- Extends test fixtures and coverage across Vitest and the three existing Playwright suites.
- Uses the existing `eventSets` and `eventSet(id)` API contract; bookshelf-api and dependency versions remain unchanged.
