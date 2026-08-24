## 1. GraphQL Preview Foundation

- [x] 1.1 Inspect the backend schema and add the `previewBookImport` operation with normalized book and author-resolution fields
- [x] 1.2 Regenerate GraphQL client/types and add authenticated `usePreviewBookImport` without query invalidation
- [x] 1.3 Extend MockStore/GraphQL handlers with a non-mutating preview response for mock API and Demo Mode

## 2. Two-Stage Import Dialog

- [x] 2.1 Centralize selected-visible candidate conversion into one `ImportBookInput[]` construction path
- [x] 2.2 Add preview response and retained preview-input state, preview execution, duplicate-submit guards, and AppErrorProvider reporting
- [x] 2.3 Render normalized import content and existing/new author labels while keeping candidate selection distinct
- [x] 2.4 Import only the retained preview input and preserve/reset state on failure/success as specified
- [x] 2.5 Invalidate preview for every file, date-filter, individual-selection, and bulk-selection change
- [x] 2.6 Include preview/import pending in busy close and input-control behavior

## 3. Component and Unit Coverage

- [x] 3.1 Update candidate-list terminology and retain JSON parsing, stale-read, inclusive-filter, selection, invalid-JSON, duplicate-submit, and failure-state regression coverage
- [x] 3.2 Test preview eligibility, selected-visible request input, normalized response display, and author resolution labels
- [x] 3.3 Test identical retained preview/import input and invalidation after checkbox, date-filter, and file changes
- [x] 3.4 Test preview/import failures, retained state, and pending duplicate-submit prevention with separate hook mocks
- [x] 3.5 Test that preview mock handling does not mutate stored books

## 4. End-to-End Coverage

- [x] 4.1 Add mock-api E2E for file selection, target selection, preview content/status, import completion, and re-preview after selection change
- [x] 4.2 Add the minimal real-backend integration preview/import happy path when the integration environment supports `previewBookImport`

## 5. Validation and Delivery

- [x] 5.1 Run code generation, lint fix, Vitest, typecheck, mock-api E2E, and applicable integration E2E
- [x] 5.2 Synchronize OpenSpec artifacts with final decisions, mark completed tasks, and pass OpenSpec validation
- [ ] 5.3 Review the final main diff and commit implementation in meaningful units under the repository commit policy
- [ ] 5.4 Push the feature branch, create/update the PR description, and resolve required CI failures
- [ ] 5.5 Obtain CodeRabbitAI approval for the latest successful-CI head and resolve all applicable review feedback
