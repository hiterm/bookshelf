## Context

TanStack Router generates the route tree from `src/routes/` and automatically
splits selected route properties. Its official Automatic Code Splitting guide
states that exporting a value used by a code-splittable property from the route
file prevents that value from being split. During `pnpm test`, TanStack Router
reported this condition for `HistoryIndexPage`; inspection found the same
structure for `HistoryDetailPage`. `pnpm build` did not report the warning.

The implementation must cover the current route tree, preserve history route
behavior and testability, and leave `bookshelf-api` unchanged.

## Goals / Non-Goals

**Goals:**

- Inspect all current route files for exported local values used by
  code-splittable route properties.
- Remove every confirmed instance and verify the warning is absent from both
  focused and full unit test runs.
- Document the durable route-file convention and make architecture documents
  discoverable to contributors.

**Non-Goals:**

- Adding an ESLint rule or a dedicated continuous/static detection mechanism.
- Writing a comprehensive routing architecture guide beyond the minimum
  automatic-code-splitting convention.
- Changing backend code, route behavior, or public APIs.

## Decisions

1. Inspect route structure as well as command output. Search every
   `src/routes/**/*.{ts,tsx}` file for `createFileRoute` or root route
   properties that reference local definitions, then determine whether those
   definitions are exported. This is authoritative for scope because build
   output alone did not surface the issue; focused and full test stderr provide
   runtime confirmation.
2. Prefer a private function in the existing route file when tests and other
   modules do not need a direct import. This is the smallest change and avoids
   unnecessary file splitting.
3. If a direct import is required, move the component to a non-route file. A
   colocated filename prefixed with `-` is preferred because TanStack Router's
   file-based route generator ignores it by default. The route file imports the
   component but does not re-export it.
4. Record the lasting rule in `docs/architecture/routing.md`, with `AGENTS.md`
   serving only as a link and contributor workflow entry point. OpenSpec
   captures this change's acceptance criteria; it does not replace the
   architecture document as the durable design source.

## Risks / Trade-offs

- **A test imports a route component directly** → Move that component and its
  direct tests to an ignored `-`-prefixed non-route file instead of restoring a
  route-file export.
- **A structurally different route export is missed** → Combine exhaustive
  route-file review with focused and full test warning checks.
- **Generated route types change unexpectedly** → Run generation,
  typechecking, unit tests, and a production build before committing.
- **The convention becomes duplicated and inconsistent** → Keep detailed
  guidance in `docs/architecture/routing.md` and only link it from `AGENTS.md`.

## Migration Plan

Remove or relocate the identified exports without changing route paths or
component behavior, regenerate the route tree, and run the required checks.
Rollback consists of reverting the frontend commit; there is no data or backend
migration.

## Open Questions

None. Whether each component remains private or moves to a non-route file will
be determined by its current direct imports during implementation.
