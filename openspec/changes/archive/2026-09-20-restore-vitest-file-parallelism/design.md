## Context

The shared Vitest configuration currently sets `fileParallelism: false`. The
override was introduced after timeouts in a constrained local agent runtime,
not after failures in GitHub Actions. It serializes 41 test files in CI and is
a likely cause of the roughly 79–80 second Vitest duration.

The change must isolate the effect of file parallelism. Existing `vmThreads`
pool and isolation behavior remain unchanged, and no worker counts, timeouts,
assertions, environments, or test layouts are adjusted.

## Goals / Non-Goals

**Goals:**

- Restore Vitest's default file parallelism in shared configuration.
- Measure CI duration and verify stability under the default behavior.
- Prevent constrained local environments from driving shared concurrency and
  timeout settings without representative reproduction.

**Non-Goals:**

- Tune or fix the worker count.
- Change the Vitest pool, isolation, environments, version, or project layout.
- Relax test assertions or timeouts.
- Rewrite historical OpenSpec archives, plans, or changelog entries.

## Decisions

Remove `fileParallelism: false` instead of setting it to `true`. Omitting the
option delegates behavior to Vitest's supported default and avoids maintaining
a redundant shared override. Explicitly setting `true` was rejected because it
would encode the current default without improving behavior.

Keep all other test execution settings unchanged so before/after CI timings
measure this single variable. Broader worker or suite restructuring was rejected
because it would obscure the result and exceed the requested scope.

Document the policy in `AGENTS.md`, next to the testing rules that govern future
changes. Resource-constrained environments can pass a command-line override
such as `--no-file-parallelism` for their own run without changing repository
defaults.

## Risks / Trade-offs

- [Parallel execution exposes hidden cross-file coupling or starvation] → Run
  the full local validation and inspect GitHub Actions failures by test and
  cause before changing shared concurrency.
- [One CI timing is affected by runner variance] → Compare large changes to the
  documented 79–80 second baseline and avoid strong conclusions from small
  differences.
- [The local agent remains resource constrained] → Use a local CLI override for
  diagnosis while preserving the shared configuration being evaluated in CI.
