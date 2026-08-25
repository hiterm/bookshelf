## Context

Book, author, history, and authentication TanStack Query hooks are stored in the shared `src/components/hooks` directory. Query keys are repeated inline in query and mutation hooks, making ownership and consistency harder to see. This refactor crosses several frontend features but must preserve all runtime, GraphQL, authentication, and cache behavior.

## Goals / Non-Goals

**Goals:**

- Make each feature own its domain-specific server-state hooks under `src/features/<feature>/api`.
- Centralize the existing query key tuples in a feature-local factory.
- Preserve existing query options, mutation effects, invalidation timing and scope, GraphQL calls, Auth0 token handling, and hook APIs.
- Keep move-only changes separate from query key implementation changes in version control.

**Non-Goals:**

- Renaming or removing `src/components`.
- Reorganizing generic hooks such as `useDebouncedEffect`.
- Redesigning cache key hierarchies or invalidation strategy.
- Refactoring authenticated SDK creation or GraphQL operations.
- Adding barrel exports, deeper `queries`/`mutations` directories, or changing component names.

## Decisions

1. Each feature receives a flat `api` directory. The current number of hooks does not justify separate query and mutation subdirectories. A deeper hierarchy can be introduced later if feature size demands it.
2. Call sites import hooks directly from `features/<feature>/api/<hook>`. Barrel files are avoided so ownership and dependency paths remain explicit.
3. Each feature exports a frozen-shape query key factory using `as const`. Factory values exactly reproduce the existing tuples; the refactor centralizes construction without migrating cache entries.
4. Query hooks and mutation invalidations both consume the factory. This establishes a single feature-local source of truth while preserving which keys are used and when.
5. The work is split into a move-only commit and a query-key commit. The first changes file locations and imports only; the second introduces factories and replaces inline arrays.
6. Existing unit tests and static checks provide regression coverage because no public behavior is added. Trivial tuple factories do not receive standalone tests unless implementation introduces branching logic.

## Risks / Trade-offs

- [Risk] A missed import could break a route, component, or test. → Search the entire repository for old hook paths and run generation, lint, unit tests, and type checking after the move.
- [Risk] A factory could accidentally change tuple spelling, ordering, or parameter values. → Inventory every QueryClient key use before editing and compare the final factory values against the original source.
- [Risk] Mutation invalidation scope or timing could drift during replacement. → Replace only the inline key expression and inspect the final diff for unchanged callbacks and surrounding logic.
- [Trade-off] Direct imports are more verbose than barrel exports. → Prefer explicit ownership and avoid introducing an additional public API surface in this refactor.
