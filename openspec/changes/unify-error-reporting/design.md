## Context

The application provider subscribes to QueryCache errors and reports them automatically. Mutation failures are reported by the UI that owns each operation. Author registration has no failure callback and user registration awaits a mutation without catching rejection. Book and author query screens sometimes serialize errors directly.

## Goals / Non-Goals

Goals are complete registration reporting, safe local messages, and one notification and persistent entry per failed attempt. API contracts, cache invalidation, author page extraction, and submission lifecycle changes are outside this change.

## Decisions

Keep mutation reporting in the operation caller. Add an onError callback to author registration and catch user registration rejection. A global MutationCache subscriber would duplicate existing catches and report intermediate author creation separately from its owning book operation, so it is unsuitable here.

Add LocalError to render a contextual title and normalizeError(error).message. It performs no reporting and shows no technical details. QueryCache remains the sole owner of persistent query reports. Replace direct serialization and raw error logging in query UI, including AuthorLoader and AuthorsFilter.

Retain registration input after failure and allow retry through the existing pending state. Existing success behavior and local form validation remain intact.

## Risks / Trade-offs

A newly added mutation UI must explicitly report failure; document this ownership in the specification and error component documentation. Raw GraphQL messages are trusted only to the same extent as the existing normalizer; full requests and arbitrary object graphs are never rendered. Test sensitive request data using real ClientError instances.

## Migration Plan

No data migration. Deploy the frontend normally; revert the source commit to roll back. Validate with Vitest, mock API and Demo E2E, build, lint, formatting, generation, and type checking. Real backend integration runs in CI only.
