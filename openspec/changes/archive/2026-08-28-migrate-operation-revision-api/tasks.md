## 1. GraphQL Contract

- [x] 1.1 Replace Event/EventSet GraphQL documents with Operation and Revision queries and update restore, import, merge, and entity mutation payload selections
- [x] 1.2 Regenerate GraphQL types, hooks, documents, MSW worker, and route tree against backend PR #324 schema
- [x] 1.3 Remove remaining production references to legacy Event/EventSet fields and generated types

## 2. History UI

- [x] 2.1 Rename EventSet components, hooks, and route parameter to Operation concepts while preserving `/history`
- [x] 2.2 Render Operation list and detail content from type, detail, createdAt, bookChanges, authorChanges, beforeRevision, and afterRevision
- [x] 2.3 Replace book and author Event history and restore flows with Revision queries and entity ID plus revision number inputs

## 3. Mocks and Tests

- [x] 3.1 Replace MSW handlers, mock store models, Demo Mode data, and E2E fixtures with Operation/Revision contract data
- [x] 3.2 Update unit tests and mock API/Demo Mode E2E tests to cover Operation navigation, Revision history, and revision-based restore
- [x] 3.3 Confirm no source, mock, fixture, or assertion depends on EventSet, BookEvent, AuthorEvent, eventSetId, or eventId

## 4. Validation and Delivery

- [x] 4.1 Run generation, formatting, lint, typecheck, unit tests, builds, and relevant local E2E suites
- [x] 4.2 Sync delta specs and archive the completed OpenSpec change
