## 1. Contract and Models

- [x] 1.1 Confirm generated frontend and current API contracts support the planned `ImportBookInput`, preview, and import values without backend changes
- [x] 1.2 Refactor Kindle parsing to retain raw author text and add pure author conversion with per-book comma-splitting settings
- [x] 1.3 Centralize typed Kindle-compatible common defaults and construct `ImportBookInput` from source, per-book settings, and common settings
- [x] 1.4 Add pure-function tests for parsing, author conversion, common settings conversion, filtering, and selection preservation

## 2. Route and Editing Experience

- [x] 2.1 Add the directly accessible `/books/import` TanStack Router route and change the `/books` import action from modal opening to navigation
- [x] 2.2 Build shared file/text source loading with local validation errors, explicit loading, preserved candidates on tab switching, and stale file-read protection
- [x] 2.3 Build the responsive candidate editor with display-only date filtering, persistent selection, visible-only bulk actions, per-book author splitting, and resolved-author display
- [x] 2.4 Build typed common settings, explicit total/visible/target counts, and a desktop sticky action region with a narrow-screen single-column fallback

## 3. Preview and Import

- [x] 3.1 Build same-URL edit and preview steps using the current selected candidates and settings for one preview request
- [x] 3.2 Retain the exact successful-preview input array, invalidate it on input-affecting edits, and use only that array for import
- [x] 3.3 Display backend-derived preview summary and book details including existing/new authors and all common attributes
- [x] 3.4 Preserve recoverable state and persistent API errors on failures, block overlapping interactions, and navigate to `/books` after successful import
- [x] 3.5 Remove obsolete dialog/modal state, reset/close behavior, and modal scroll/size implementation

## 4. Automated Coverage

- [x] 4.1 Add component tests for file/text loading, source errors, stale reads, default/editable settings, filtering, selection, splitting, and bulk actions
- [x] 4.2 Add component tests for preview inputs, step transitions, invalidation, exact retained-input import, pending locks, error recovery, and success navigation
- [x] 4.3 Add router/navigation tests for `/books` import navigation and direct `/books/import` access
- [x] 4.4 Add or update mock-API E2E coverage for navigation, loading, settings, per-book splitting, selection, preview author status, import, and resulting list state
- [x] 4.5 Update real-backend integration coverage for split author names and unchanged preview/import behavior, leaving local execution to CI

## 5. Verification and Delivery

- [ ] 5.1 Regenerate GraphQL, MSW, and route artifacts and pass lint, unit/component tests, and typecheck before each implementation commit
- [ ] 5.2 Pass the production build and mock-API E2E suite without weakening or skipping unrelated tests
- [ ] 5.3 Reconcile proposal, design, delta spec, and tasks with the final implementation and mark every task complete
- [ ] 5.4 Sync the book-import delta into the canonical spec and archive the OpenSpec change
- [ ] 5.5 Review the final diff and commit history for scope, parser/converter boundaries, exact preview/import inputs, filter/selection independence, route generation, and modal removal
- [ ] 5.6 Push the branch, create the documented PR, and confirm all GitHub Actions checks including integration succeed
- [ ] 5.7 Request CodeRabbit review after green CI, address or explain every finding, rerun checks after changes, and obtain CodeRabbit approval
