## Why

API and GraphQL failures are currently communicated primarily through short-lived notifications, making them difficult to inspect or copy after the notification disappears. Users need durable, dismissible error information for troubleshooting while still receiving immediate feedback.

## What Changes

- Add an in-memory application error model and centralized reporting API for API, GraphQL, query, mutation, and unexpected frontend failures.
- Keep transient Mantine notifications for immediate failure feedback while also retaining errors above routed content until explicitly dismissed.
- Allow users to expand safe technical details, copy issue-ready error text, dismiss one error, or dismiss all errors.
- Normalize unknown errors and GraphQL client errors without copying request headers, credentials, tokens, cookies, or GraphQL variables.
- Migrate existing feature-level failure notifications to centralized reporting without changing successful notifications or field validation errors.
- Add unit, component, regression, and mock API end-to-end coverage for the complete failure flow.

## Capabilities

### New Capabilities

- `persistent-error-reporting`: Durable application error reporting, safe detail normalization, expansion, copying, and dismissal alongside transient notifications.

### Modified Capabilities

None.

## Impact

The frontend application provider hierarchy, root AppShell layout, shared error components, React Query error handling, and failure paths in book, author, and import features are affected. The change uses existing React, Mantine, React Query, and graphql-request dependencies and does not change backend responses, persistence, form validation, success notifications, or external error tracking.
