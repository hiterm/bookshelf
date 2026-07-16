# Migrate the frontend to canonical mutation payloads

This ExecPlan is a living document maintained according to `.agent/PLANS.md`. The `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` sections must remain current.

## Purpose / Big Picture

The frontend currently reads compatibility fields directly from GraphQL mutation payloads. After this work, it reads created and updated books and authors from `book` and `author`, and deleted identifiers from `bookId` and `authorId`. Users retain the same CRUD behavior while the API can safely remove duplicate compatibility fields.

## Progress

- [x] (2026-07-16) Milestone 1: Inspect the mutation documents, consumers, and both mock implementations and establish the coordinated rollout order.
  - [x] plan updated
- [x] (2026-07-16) Milestone 2: Migrate documents, consumers, mocks, generated artifacts, and tests.
  - [x] plan updated
- [ ] Milestone 3: Run generation, linting, unit tests, type checking, and relevant E2E tests, then commit and publish the frontend PR (completed: all mandatory checks pass; E2E cannot launch because the host lacks `libnspr4.so`; remaining: commit and publish).
  - [ ] plan updated
- [ ] Milestone 4: Validate the frontend against the alias-free candidate API schema (completed: GraphQL Codegen accepts all mutation documents; remaining: full typecheck is blocked by the candidate schema's unrelated pre-existing requirement for `Author.yomi`).
  - [ ] plan updated

## Surprises & Discoveries

- Observation: Both MSW handlers and executable mock resolvers currently return entity objects directly, matching the deprecated aliases rather than the payload object.
  Evidence: `src/mocks/handlers.ts` spreads books and authors at the mutation root, and `e2e-mock-api/resolvers.ts` returns store entities directly.
- Observation: Playwright cannot launch the downloaded Chromium on this host because `libnspr4.so` is missing, and `playwright install-deps` requires an unavailable sudo password.
  Evidence: All targeted E2E cases stop during `browserType.launch` before loading a page; unit tests and TypeScript checks succeed.
- Observation: The candidate API SDL is ahead of the released frontend SDL in an unrelated area: it makes `Author.yomi` required while existing frontend fixtures omit it.
  Evidence: GraphQL Codegen succeeds against the candidate SDL, then full typecheck reports only missing `yomi` errors in existing history/list fixtures and mappings.

## Decision Log

- Decision: Migrate and publish the frontend before removing API aliases.
  Rationale: The current API supports canonical selections, but an alias-free API rejects the old frontend during GraphQL validation.
  Date/Author: 2026-07-16 / Codex
- Decision: Run existing mutation CRUD E2E coverage rather than add a new endpoint E2E test.
  Rationale: No endpoint is being added; the behavior change is a response-shape migration already exercised by existing CRUD flows.
  Date/Author: 2026-07-16 / Codex

## Outcomes & Retrospective

The frontend now uses canonical mutation response shapes in operations, production consumers, and both test-double implementations. Generation, formatting, 95 unit tests, and all TypeScript project checks pass against the released schema. Browser E2E and a full candidate-schema typecheck remain environment/version blockers documented above; mutation document generation against the alias-free schema succeeds.

## Context and Orientation

Handwritten operations live under `src/graphql/` and generate TypeScript SDK artifacts through `pnpm run generate`. Production callers that consume created IDs live in `src/features/books/BookAddButton.tsx` and `src/features/books/BookDetailEdit.tsx`. Browser demo tests use MSW handlers in `src/mocks/handlers.ts`; Playwright mock-API tests use executable GraphQL resolvers in `e2e-mock-api/resolvers.ts`.

## Plan of Work

Change create and update selections to nest entity fields under `book` or `author`, and delete selections to request the descriptive identifier. Update production ID reads and make both mock layers return payload objects with the same nesting. Regenerate artifacts, repair affected expectations, and run all repository-mandated checks. Finally, generate or validate with the candidate alias-free API schema and confirm type checking remains clean.

## Concrete Steps

From the `bookshelf` repository run `pnpm run generate`, `pnpm run lint:fix`, `pnpm run test`, and `pnpm run typecheck`. Discover the relevant Playwright project names from configuration and run the mutation-related mock API and demo-mode specs. Before committing, rerun the four mandatory commands in their required order.

## Validation and Acceptance

Generated operations must contain no direct compatibility selections. Unit and relevant E2E tests must show that create, update, and delete still work with canonical payload objects. Type checking must pass against the candidate API schema as well as the normal generated artifacts.

## Idempotence and Recovery

Generation and validation commands are repeatable. If candidate-schema generation changes artifacts unexpectedly, inspect the diff and rerun normal generation only after preserving evidence of compatibility. No database or destructive migration is involved.

## Artifacts and Notes

The API change is tracked separately in `bookshelf-api/.agent/plans/20260716-unify-mutation-payloads.md`. Deployment order is frontend first, API second.

## Interfaces and Dependencies

No dependency changes are needed. The required response interfaces are `createBook.book`, `updateBook.book`, `createAuthor.author`, `updateAuthor.author`, `deleteBook.bookId`, and `deleteAuthor.authorId`.

Plan revision note (2026-07-16): Recorded the completed migration and mandatory checks, plus the Playwright host-library and unrelated candidate-schema `Author.yomi` blockers.
