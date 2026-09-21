# Rstest migration experiment

## Decision

Do not adopt Rstest 0.12.0 in this change. Runtime parity was achievable, but the migration did not pass TypeScript and the local speed difference was too small to justify the additional compatibility work. The trial changes were restored; Vitest remains the active runner. No Rstest CI comparison was run, so this experiment does not establish a CI improvement.

## Baseline and discovery

The baseline used Node v24.18.0, pnpm 11.24.0, Vitest 5.0.1, `pnpm run test`, jsdom, `vmThreads`, default worker count, no coverage, and the existing setup file. Both runs had 41 files, 223 passing tests, zero skipped, zero failed, and zero snapshots. `vitest list --filesOnly` provided the manifest.

Rstest 0.12.0 used the same Node version, jsdom, `vmThreads`, default worker count, no coverage, and the same test-file exclusions. Its `list --filesOnly` manifest matched all 41 Vitest paths. This includes `e2e-mock-api/mockStore.test.ts`, which is a unit test inside an E2E directory; the Playwright `*.spec.ts` files remained excluded. With `globals: true`, `@rstest/core/globals` types, the shared stream setup, direct jest-dom matcher registration, and the React plugin, Rstest executed 41 files and 223 tests with zero skips, failures, or snapshots. No production code or Playwright E2E suite was changed in the trial.

## Local measurements

All timings are seconds on the same machine. Wall time includes the command process; runner time is the duration printed by the runner. The Rstest default bundled mode was not a valid parity measurement because it changed a Zod validation message and failed an existing assertion.

| Runner and configuration                        |  Wall | Runner | Files | Tests | Result |
| ----------------------------------------------- | ----: | -----: | ----: | ----: | ------ |
| Vitest baseline, run 1                          | 44.24 |  39.91 |    41 |   223 | Pass   |
| Vitest baseline, run 2                          | 41.24 |  38.40 |    41 |   223 | Pass   |
| Rstest, all dependencies external               | 58.80 |  55.70 |    41 |   223 | Pass   |
| Rstest, only Zod external                       | 40.15 |  36.80 |    41 |   223 | Pass   |
| Rstest, only Zod external, public `test` script | 40.50 |  36.90 |    41 |   223 | Pass   |

The two comparable Zod-externalized Rstest runs were only about 1–4 seconds faster in wall time than the two Vitest runs. Rstest reported build time of 0.11–0.19 seconds and test execution of about 36.7–36.8 seconds. Externalizing all dependencies increased test execution to 55.6 seconds, so the regression was runtime loading rather than build startup. The retained narrow exception would have been `output.externals: ["zod", /^zod\//]`; it preserved Zod's `Too small` message without changing the assertion. No worker setting was tuned to manufacture a speedup.

## Compatibility cost

The migration required test-only API replacement in 35 files (321 Vitest references), the official React plugin for automatic JSX, and seven synchronous partial-mock rewrites with static `importActual` imports. A hook that returned `rs.resetAllMocks()` also needed a block body. These changes preserved runtime assertions and scenarios.

The final typecheck trial failed with 277 diagnostics: 255 missing jest-dom matcher methods on Rstest assertions, 21 errors where Rstest mock typing rejected existing partial query or mutation results, and one hook return-type error. The jest-dom package's provided integration type augments Vitest, not Rstest. Fixing these would require a project-owned matcher augmentation and further test-specific mock typing changes. Given the size of those changes and the small local speed difference, the experiment stopped before removing Vitest or committing runner changes. No temporary compatibility alias or weakened assertion remains in the repository.

## CI and follow-up

The latest inspected Vitest CI `test` job completed in 121 seconds on [main run 35422104638](https://github.com/hiterm/bookshelf/actions/runs/35422104638), including setup and package installation. No Rstest commit was pushed for CI because the typecheck gate failed, so a same-workflow Rstest CI duration and CI discovery count are unavailable. Local measurements must not be presented as a CI speedup.

The OpenSpec delta specs record the decision rule for future runner experiments without changing the supported Vitest 5 contract. A future attempt should first establish a supported matcher type integration and partial-mock typing strategy, then repeat parity and CI timing measurements.
