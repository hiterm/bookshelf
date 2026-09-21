# Restore the Rstest migration

This ExecPlan is a living document maintained under `.agent/PLANS.md`. Keep its Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective sections current as implementation proceeds.

## Purpose / Big Picture

The repository's unit and component tests should run on Rstest 0.12.0 with the same files, assertions, and behavior as the current Vitest suite. A contributor can verify the result with `pnpm run test` and `pnpm run typecheck`. This work also determines whether Rstest can type the existing partial mock results without casts or weaker production types.

## Progress

- [x] (2026-09-21) Confirm `chore/migrate-to-rstest` is clean and current; read the archived experiment, test configuration, current specifications, and plan instructions.
- [x] (2026-09-21) Restore Rstest dependencies, configuration, setup, and test-only API calls while preserving 41 test files and 223 passing tests.
- [x] (2026-09-21) Classify the 22 remaining TypeScript diagnostics and resolve them with complete typed React Query fixtures and a block-bodied hook callback; `pnpm run typecheck` passes.
- [x] (2026-09-21) Run generation, linting, formatting, type checking, and tests; record zero remaining diagnostics and 41 files / 223 passing tests.
- [x] (2026-09-21) Commit the validated migration and update the existing PR description to match its implementation.

## Surprises & Discoveries

The prior experiment did not commit its trial code. Its record reports 41 files and 223 passing tests, with 277 TypeScript diagnostics: 255 jest-dom matcher errors, 21 partial mock result errors, and one hook return error. A follow-up investigation reproduced those counts and showed that adding `@testing-library/jest-dom` to `compilerOptions.types` removes all 255 matcher errors.

Rstest 0.12.0 declares `MaybePartiallyMocked<T>` for a function as `MockedFunction<T>`, preserving the full function return type. Vitest 5 declares `PartiallyMockedFunction<T>` using a partial result function. This explains all 21 partial hook-result diagnostics despite the identical `{ partial: true }` call syntax. A shared test fixture that returns complete TanStack Query success, loading, error, and idle mutation states resolves the errors without casts, `any`, or type suppression. The suite passed 41 files and 223 tests before and after these fixture changes.

An experiment with a fully typed `rs.mock<typeof import('@tanstack/react-router')>` factory showed that its generic `useNavigate` override does not satisfy every generic route signature. The official string-path `rs.mock` form with a typed static `importActual` namespace remains the supported migration pattern; the backup module factory can additionally use a module type parameter because its export signatures are concrete.

## Decision Log

- Decision: Use the Rstest React and Vitest migration setup with `expect.extend` and an explicit jest-dom entry in TypeScript `types`.
  Rationale: This is the published React TypeScript template's combination and avoids custom matcher declarations.
  Date/Author: 2026-09-21 / Codex.
- Decision: Keep production hook and component types unchanged while investigating mock results.
  Rationale: Test fixtures must satisfy the real return contracts; the runtime migration does not justify weakening application types.
  Date/Author: 2026-09-21 / Codex.
- Decision: Replace partial hook return objects with complete test-only TanStack Query results in `src/test/reactQueryResults.ts`.
  Rationale: Rstest 0.12.0 does not provide Vitest's partial function-return mock type. Complete success, loading, error, and idle states are type-correct and preserve the scenarios under test.
  Date/Author: 2026-09-21 / Codex.
- Decision: Keep the six React Router partial factories on the documented string-path `rs.mock` API and use static `importActual` imports.
  Rationale: Rstest's typed factory cannot represent these generic `useNavigate` test stubs without a different router mock design. The official form eliminates asynchronous factory errors without casts or suppressions.
  Date/Author: 2026-09-21 / Codex.

## Outcomes & Retrospective

The migrated suite passes 41 files and 223 tests. TypeScript reports zero diagnostics after replacing partial hook results and fixing the hook callback. Generation, linting, formatting, and OpenSpec validation pass. The migration is committed without pushing.

## Context and Orientation

`vite.config.ts` currently contains the Vitest jsdom configuration and test exclusions. `src/test/setup.ts` installs the jest-dom Vitest adapter and stream polyfills. `tsconfig.json` exposes Vitest globals. `package.json` and `pnpm-lock.yaml` pin the runner. Unit tests under `src` and `e2e-mock-api/mockStore.test.ts` import Vitest APIs. The Playwright `*.spec.ts` suites are separate. The archived trial at `openspec/changes/archive/2026-09-21-migrate-unit-tests-to-rstest/experiment.md` is historical evidence and must remain unchanged. Current runner specifications live in `openspec/specs/frontend-test-runtime/spec.md`.

## Plan of Work

Install Rstest 0.12.0 and the official React plugin, then move runner configuration from Vite to `rstest.config.ts`. Retain jsdom, VM threads, setup, exclusions, and the Zod externalization needed to preserve the existing validation message. Replace Vitest's test APIs in test files with Rstest APIs; convert seven asynchronous partial module factories to Rstest's static `importActual` form. Configure matcher registration at runtime and in TypeScript. Run type checking and inspect each error against the corresponding hook's declared result, then construct accurate test results through the public Rstest mock APIs where possible. Update current documentation that prescribes Vitest when adoption succeeds.

## Concrete Steps

Work from `/home/hiterm/ghq/github.com/hiterm/bookshelf` on `chore/migrate-to-rstest`. Run `pnpm add -D @rstest/core@0.12.0 @rsbuild/plugin-react@2.1.0`, edit the files above, and run `pnpm run typecheck` plus `pnpm run test`. Before `git commit`, run the mandatory `pnpm run generate`, `pnpm run lint:fix`, `pnpm run format`, `pnpm run test`, and `pnpm run typecheck` commands. The test manifest should remain 41 files and 223 tests. Type checking should report no jest-dom matcher errors; the goal is no remaining diagnostics.

## Validation and Acceptance

`pnpm run test` should pass the existing 41 files and 223 tests on Rstest without changed assertions. `pnpm run typecheck` should accept jest-dom matchers through package types and should expose any remaining mock errors without casts or suppressions. The Playwright suites should retain their current configuration. Review the diff for production changes before committing.

## Idempotence and Recovery

Dependency changes are pinned and lockfile backed. If an install fails because of local sandbox access, retry only with the sandbox permission needed for the same command; never alter `.npmrc` or global npm settings. Preserve the archived experiment. Keep intermediate typecheck outputs in `/tmp` so repeated checks do not change the repository.

## Artifacts and Notes

The follow-up investigation observed 277 diagnostics in the reconstructed trial, then 22 after adding the official jest-dom type entry. The 22 were 21 `TS2345` partial mock result errors and one `TS2322` hook return error. The clean Vitest branch passed `pnpm run typecheck` before this migration. The restored Rstest suite then passed `pnpm run typecheck` with zero diagnostics and `pnpm run test` with 41 files and 223 tests.

## Interfaces and Dependencies

`@rstest/core@0.12.0` supplies `expect`, `rs`, mocks, globals, and the test runner. `@rsbuild/plugin-react` enables the automatic React JSX transform in Rstest. `@testing-library/jest-dom/matchers` supplies functions for `expect.extend`; `@testing-library/jest-dom` supplies the matcher declarations via `compilerOptions.types`. Rstest `rs.mocked(fn, { partial: true })` preserves a function's full return type in this release. `src/test/reactQueryResults.ts` constructs complete `UseQueryResult<T>` and `UseMutationResult<TData, Error, TVariables>` objects for mocks of hooks whose production contracts use TanStack Query.

Plan created on 2026-09-21 to guide the requested restoration and investigation.
Plan updated on 2026-09-21 after runtime parity and complete type-check validation.
Plan updated on 2026-09-21 after all required pre-commit checks passed.
