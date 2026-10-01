# Unify failure reporting and safe local error messages

This ExecPlan follows `.agent/PLANS.md`. Keep its living sections updated as work proceeds.

## Purpose / Big Picture

Users must be able to see and retry failed author or user registration. All local query failure messages must exclude GraphQL request headers and variables. A failed request produces one notification and one persistent error, even when its local UI rerenders.

## Progress

- [x] (2026-10-01) Pull latest main (7caadbf), inspect issue #406 item 1, and create OpenSpec change unify-error-reporting.
- [x] (2026-10-01) Implement safe local query displays and caller-owned registration reports.
- [x] (2026-10-01) Verify 289 unit tests, 58 mock API E2E, 14 Demo E2E, generation, lint, formatting, type checks, and build.
- [ ] Sync and archive the completed OpenSpec change.
- [ ] Create PR and complete CI and CodeRabbit review without merging.

## Surprises & Discoveries

Git metadata writes require escalated sandbox permissions. QueryCache already reports query failures; mutation failures are currently reported by owning UI catches. RegisterAuthorForm and RegisterCheck are the two missing reporting paths.

## Decision Log

- Decision: Keep mutation reporting in the owning UI.
  Rationale: A global mutation subscriber would duplicate existing catches and report intermediate author creation separately from the book operation.
  Date/Author: 2026-10-01, Codex.
- Decision: Share only local error rendering; use the existing normalizeError function.
  Rationale: Local rendering must have no reporting side effects and should use the same safe message as persistent errors.
  Date/Author: 2026-10-01, Codex.

## Outcomes & Retrospective

Implementation and local validation are complete. Real backend integration is reserved for CI. OpenSpec sync/archive and PR review remain.

## Context and Orientation

`src/components/errors/AppErrorProvider.tsx` stores application errors in memory and emits notifications. It subscribes to TanStack Query's QueryCache, the shared request state store. `src/components/errors/appError.ts` normalizes unknown errors; GraphQL ClientError is handled before ordinary Error to avoid its request-bearing message. `src/routes/authors/index.tsx` owns author registration; `src/routes/__root.tsx` owns user registration. API hooks in `src/features/*/api` do not report mutation errors. Existing book save callers catch their composed operation failures.

## Plan of Work

Create `src/components/errors/LocalError.tsx` using Mantine Alert and normalizeError(error).message, with a contextual title. Replace raw serialization in books index/detail/edit routes, BookUpdateForm, authors index, and root registration checks. Replace raw logging in BookCreateForm, AuthorLoader, and AuthorsFilter. In RegisterAuthorForm and RegisterCheck catch mutateAsync rejection. Preserve current pending guards and form values. Add unit tests for safe rendering and E2E tests exercising actual registration hooks with failing GraphQL responses, verifying exactly one notification and persistent record and successful retry. Document reporting ownership under `docs/architecture/error-reporting.md`.

## Concrete Steps

From the repository root run `openspec instructions apply --change unify-error-reporting --json` and read all listed context files. Implement each task and update tasks.md immediately. Run `pnpm run generate`, `pnpm run lint:fix`, `pnpm run format`, `pnpm run test`, and `pnpm run typecheck` before source commits. Documentation commits require lint:fix and format. Use `pnpm run build` and relevant mock API and Demo browser tests. Never run real backend integration locally. Sync the added requirements into `openspec/specs/persistent-error-reporting/spec.md`, validate and archive the change with the OpenSpec CLI. Keep source and OpenSpec commits separate. Push the branch and create a PR with Summary, Why, What changed, and Testing sections, adding a Mermaid diagram only if useful. Check CI, request @coderabbitai review, address and reply to comments, and wait for approval. Do not merge.

## Validation and Acceptance

A ClientError with secret request headers and variables displays its response message locally, with no secrets or arbitrary object serialization. Author registration retains name and reading after failure, records one persistent error and one notification, and succeeds when retried. User registration handles rejection, re-enables its button, and succeeds when retried. Invalid author input makes no API request or persistent report. Existing book operation reporting and all existing unit tests remain passing. CI runs the real backend integration suite.

## Idempotence and Recovery

The change has no schema migration. Re-run failed verification after fixes; do not alter npm configuration or shared worker/timeouts to compensate for this environment. Rollback consists of reverting source changes. OpenSpec archive retains the completed artifacts as historical records.

## Artifacts and Notes

Baseline: 7caadbf, pulled from origin/main. OpenSpec change: openspec/changes/unify-error-reporting.

## Interfaces and Dependencies

Use existing Mantine, TanStack Query, graphql-request, Vitest, and Playwright libraries. LocalError accepts `error: unknown` and `title: string` and renders normalized message only. reportError remains the existing application context operation with title, optional operation, and unknown error.

Revision note: Implementation uses mutateAsync catches so failures remain reportable after unmount. Local validation passes; archive and PR gates remain.
