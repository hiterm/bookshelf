## Context

The frontend currently reports many caught API and GraphQL failures with Mantine notifications that expire automatically. Failure handling is duplicated across book, author, and import components, and some query failures only render a local blocking state. The application already uses React, Mantine, React Query, and graphql-request. The provider hierarchy is `QueryClientProvider` → `MantineProvider` → `AppRoot`, while the root route owns both `<Notifications />` and `AppShell.Main`.

The design must retain errors across route navigation but not page reload, preserve existing successful notifications and form validation, and avoid collecting sensitive request metadata. No new state-management, error-panel, or tracking dependency is warranted.

## Goals / Non-Goals

**Goals:**

- Centralize caught failure reporting so one call creates both immediate and persistent feedback.
- Keep multiple errors in memory until users explicitly dismiss them.
- Provide accessible expansion, copying, individual dismissal, and all dismissal using Mantine primitives.
- Normalize ordinary errors and graphql-request `ClientError` values into safe, stable display data.
- Report query failures once per React Query error transition without render-driven duplication.
- Preserve screen-specific blocking query states as a separate responsibility.

**Non-Goals:**

- Persist errors across reloads or store an error history in localStorage or a backend.
- Change backend error responses, form validation, successful notifications, or authorization behavior.
- Capture request headers, cookies, credentials, tokens, full requests, or GraphQL variables.
- Add Sentry, another external tracker, or a new state-management/UI library.

## Decisions

Use a React Context provider inside `MantineProvider` and outside `AppRoot`. This lifecycle keeps state across route navigation, permits Mantine notifications, and naturally clears state on reload. Redux or Zustand would add unnecessary dependency and architecture for local in-memory UI state.

Define a bookshelf-specific `AppError` model and `reportError` API. `reportError` normalizes the unknown caught value, appends an error with a browser-generated UUID and timestamp, and emits the transient red notification. Keeping both effects in one API prevents callers from accidentally implementing only one half.

Normalize `ClientError` by reading only the response status, GraphQL messages, paths, and sanitized scalar extension values. Never serialize `ClientError.message` or its request object because graphql-request embeds request context there. Sensitive extension keys are removed, non-scalar extension objects are omitted, and request headers and variables are never inspected. Ordinary `Error` values retain their message and stack; arbitrary unknown objects receive a generic message instead of unrestricted serialization.

Render a thin `ErrorPanel` before routed content in `AppShell.Main`. Compose Mantine `Alert`, `Collapse`, `Button`, `Code`, `Group`, `Stack`, and text primitives rather than implementing new UI primitives. Each entry owns only its expansion state. Clipboard text formatting remains a pure function, while browser Clipboard API failure produces a transient notification and never recursively creates another persistent error.

Subscribe once in the provider to error transition events from the application's shared React Query `QueryCache`. This reports all query failures without component render effects or repeated registrations. Use the generic operation name `Query` and omit query keys because keys can contain identifiers or variables. Existing local query error UI remains because it explains why an individual screen cannot render.

Keep feature-specific Japanese titles and stable GraphQL operation identifiers at call sites. This provides meaningful user context and developer diagnostics while moving normalization, color selection, storage, and notification behavior out of feature components.

## Risks / Trade-offs

- [Many failures can grow the panel during one browser session] → Preserve all entries as required and provide both individual and all dismissal controls.
- [Query error notifications use a generic title] → Retain local screen-specific error UI and the normalized technical message; avoid query keys that may expose variables.
- [Error stacks can be long] → Render preformatted code with wrapping and overflow protection.
- [Clipboard access can be denied] → Show a one-off transient failure notification without adding a persistent error.
- [GraphQL extensions may contain secrets under unexpected keys] → Allow only sanitized scalar/array values, redact common sensitive key names, omit nested objects, and never inspect requests.

## Migration Plan

Add the model, normalization, context, panel, and tests first. Mount the provider and panel, then migrate existing mutation failure catches while retaining successful notifications and validation errors. Enable the QueryCache subscription after the provider is mounted. Add representative mock API E2E coverage, run the mandatory generation/lint/test/typecheck workflow and the full mock API E2E suite, then deploy as a frontend-only change. Rollback consists of reverting the provider/panel mounting and restoring direct failure notifications; there is no persisted data to migrate.

## Open Questions

None. Error persistence beyond a page reload and external tracking are explicitly deferred.
