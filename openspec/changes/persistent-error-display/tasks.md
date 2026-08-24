## 1. Error Model and Reporting

- [x] 1.1 Add the `AppError` model, report input, safe unknown/ClientError normalization, and clipboard formatter
- [x] 1.2 Add unit coverage for ordinary, GraphQL, string, unknown, nullish, sensitive, and clipboard-format cases
- [x] 1.3 Add the React Context provider with report, individual dismiss, all dismiss, and QueryCache error-transition reporting

## 2. Persistent Error Interface

- [x] 2.1 Mount the provider inside Mantine and render the panel above routed content
- [x] 2.2 Build the Mantine-based panel with accessible expand, copy, close, and close-all controls
- [x] 2.3 Add component coverage for empty, multiple, persistent, detailed, copied, failed-copy, and dismissed states

## 3. Feature Migration

- [x] 3.1 Migrate book create, update, delete, and author-creation failure catches to `reportError`
- [x] 3.2 Migrate author update, delete, and merge failure catches to `reportError`
- [x] 3.3 Migrate book import request failure while retaining local file-validation errors
- [x] 3.4 Update affected feature test wrappers and regression assertions without changing successful notifications

## 4. End-to-End Coverage

- [x] 4.1 Add a mocked book-update failure covering immediate notification, persistent panel, details, timeout survival, and dismissal
- [x] 4.2 Run the focused persistent-error Playwright scenario

## 5. Final Verification and Delivery

- [x] 5.1 Run code generation and confirm no unintended generated diffs
- [x] 5.2 Run lint/format fixes and resolve all findings
- [x] 5.3 Run the complete unit/component suite and TypeScript checks after final formatting
- [x] 5.4 Run the complete mock API E2E suite
- [x] 5.5 Review the final diff, commit meaningful units, create the pull request, and verify CI readiness

## 6. Review Follow-up

- [x] 6.1 Redact `apiKey` and `x-api-key` extension fields and add regression coverage
- [x] 6.2 Align isolated provider subscriptions with their active QueryClient instances
- [ ] 6.3 Run mandatory checks, push the review fixes, and verify the PR review state
