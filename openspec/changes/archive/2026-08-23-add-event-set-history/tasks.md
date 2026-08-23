## 1. Data Contract

- [x] 1.1 Add minimal EventSet list and complete EventSet detail GraphQL documents using the current API schema
- [x] 1.2 Regenerate GraphQL SDK, request types, MSW helpers, and route types and review generated changes
- [x] 1.3 Add thin authenticated React Query hooks with stable EventSet list and detail query keys

## 2. History Presentation

- [x] 2.1 Implement open-string EventSet and event operation label helpers with known Japanese mappings and raw-value fallbacks
- [x] 2.2 Implement the accessible vertical EventSet list with local timestamps, empty state, and detail navigation
- [x] 2.3 Implement the EventSet detail header and separate BookEvent and AuthorEvent accordion sections
- [x] 2.4 Render nullable snapshot fields consistently and non-null `extra` values in a separate formatted JSON disclosure

## 3. Routes and Navigation

- [x] 3.1 Add the thin `/history` route with loading, error, success, and empty states
- [x] 3.2 Add the thin `/history/$eventSetId` route with loading, error, not-found, success, and back-navigation states
- [x] 3.3 Add the user-facing "変更履歴" Navbar destination after books and authors

## 4. Unit and Component Tests

- [x] 4.1 Test known and unknown operation label behavior
- [x] 4.2 Test EventSet list rendering, empty state, timestamp, multiple entries, keyboard-accessible router navigation
- [x] 4.3 Test EventSet detail sections, collapsed defaults, expansions, nullable values, optional extra JSON, and single-kind EventSets
- [x] 4.4 Test route and hook handling for loading, errors, null details, and successful data where existing test conventions require it

## 5. End-to-End Coverage

- [x] 5.1 Extend the per-test mock API store and handlers for EventSet list and detail queries and cover list-to-detail navigation
- [x] 5.2 Extend Demo Mode's browser-isolated fixtures and handlers minimally and cover Navbar-to-history-to-detail navigation
- [x] 5.3 Add a real-backend integration flow that performs a representative mutation and follows its EventSet from the list into detail

## 6. Verification and Delivery

- [x] 6.1 Run generation, lint autofix, unit tests, and type checking and resolve all failures
- [x] 6.2 Run mock API, Demo Mode, and integration E2E suites in their required environments and resolve all actionable failures
- [x] 6.3 Review final generated files, diff, and repository status for unintended changes
- [x] 6.4 Validate OpenSpec artifacts, reconcile them with the implementation, and mark all completed tasks
- [x] 6.5 Archive the completed OpenSpec change and sync its delta spec into the main specifications
- [ ] 6.6 Commit meaningful green units, push the feature branch, create the main-targeting PR, and verify initial CI status
