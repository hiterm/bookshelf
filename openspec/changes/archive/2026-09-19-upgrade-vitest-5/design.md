## Context

The repository runs Vitest through the root Vite configuration with globals,
jsdom, and serial test-file execution. Component tests currently register DOM
matchers independently through the generic `@testing-library/jest-dom` entry
point. Vitest 5 no longer reads matcher declarations from `jest.Matchers`, so
the generic setup does not provide Vitest's matcher types.

The repository already declares Node 24.x and Vite 8, satisfying Vitest 5's
Node >=22.12 and Vite >=6.4 prerequisites. It does not use Vitest browser mode,
projects, coverage, custom reporters, snapshots, benchmarks, custom assertion
types, `expect.poll`, `test.for`, sequential options, or removed entry points.

## Goals / Non-Goals

**Goals:**

- Install the latest stable Vitest 5.x release with a consistent pnpm lockfile.
- Register jest-dom matchers and their types through the Vitest-specific entry
  point for every unit/component test.
- Preserve existing test semantics while accepting Vitest 5's default mock-call
  clearing behavior.
- Validate the migration through clean installation, static checks, tests, and
  a production build.

**Non-Goals:**

- Adopt Vitest browser mode, projects, coverage, snapshots, or new test APIs.
- Add compatibility flags for breaking changes that do not affect this codebase.
- Change application behavior or historical artifacts.

## Decisions

### Use one source-level setup file

Create a setup file near the source tests that imports
`@testing-library/jest-dom/vitest`, and load it with `test.setupFiles` in
`vite.config.ts`. This entry point registers matchers against Vitest's `expect`
and augments `vitest.Matchers`, so no handwritten global declarations or
TypeScript suppression is needed. Keeping `vitest/globals` in `tsconfig.json`
continues to provide global test APIs.

An alternative was to retain generic imports in every component test and add a
manual declaration merge. That duplicates runtime setup and would conceal the
actual Vitest 5 integration requirement.

### Keep the Vitest 5 mock default

Vitest 5 enables `clearMocks` by default. The tests do not intentionally assert
mock call history across tests; they already reset state where implementation
or behavior must be restored. Do not set `clearMocks: false`, because doing so
would preserve accidental coupling rather than application behavior.

### Limit compatibility edits to used features

Repository searches and test execution determine whether migration changes are
needed. Existing `test.each` cases do not depend on generated titles or snapshot
output, and the repository has no affected `test.for`, `expect.poll`, nested
hoisted mocks, sequential options, custom reporters, or browser-mode matchers.
No speculative configuration is added for those changes.

## Risks / Trade-offs

- **Mock call history is now cleared before each test** → Run the complete suite
  and adjust only assertions that demonstrably relied on cross-test state.
- **A global setup affects all unit tests** → The Vitest-specific jest-dom entry
  point is idempotent and intended for setup files; verify pure logic tests too.
- **The lockfile may include substantial transitive changes** → Update through
  pnpm for only the direct Vitest dependency and validate with frozen install.
