## 1. Visible author splitting

- [x] 1.1 Add visible-only split and unsplit controls to `BookImportTable` and wire Set updates through the page without changing index identity
- [x] 1.2 Add component tests for bulk enable, bulk disable, hidden preservation, individual override, preview invalidation, and preview authorNames

## 2. Reachable primary actions

- [x] 2.1 Create a compact Book Import action bar with AppShell-aware fixed positioning, safe-area spacing, and reserved page space
- [x] 2.2 Add the mobile-only selected-count Preview action while preserving the desktop 8:4 sticky settings UI
- [x] 2.3 Add fixed count-aware Back and Import preview actions with existing disabled/loading behavior
- [x] 2.4 Add component tests for count-aware labels, busy controls, and responsive display conditions

## 3. End-to-end and local validation

- [x] 3.1 Extend mock-API Playwright coverage for bulk split through preview and import
- [x] 3.2 Add mobile viewport coverage proving Preview is operable without scrolling to settings
- [x] 3.3 Run generation, lint fixing, Vitest, type checking, and relevant mock-API or demo-mode E2E tests without running local integration tests

## 4. Specification and delivery

- [ ] 4.1 Reconcile implementation with tasks and delta specification, then synchronize the canonical `book-import` specification
- [ ] 4.2 Archive the completed OpenSpec change and commit the archive result
- [ ] 4.3 Push the branch, open a main-targeting PR with requested implementation and test details, and verify all GitHub Actions including integration succeed
