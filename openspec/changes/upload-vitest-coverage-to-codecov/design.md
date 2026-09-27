## Context

The unit-test job already runs `pnpm run test:coverage` and publishes Vitest's text table to the GitHub Actions job summary. The V8 coverage provider currently emits only the text reporter, so there is no file for Codecov to consume. The repository has a `CODECOV_TOKEN` Actions secret and pins third-party actions by commit SHA.

## Goals / Non-Goals

**Goals:**

- Preserve the existing detailed text report in logs and the job summary.
- Produce LCOV output and upload it to Codecov from the unit-test job.
- Make upload failures visible while keeping low coverage percentages non-blocking.

**Non-Goals:**

- Defining or enforcing coverage thresholds.
- Adding Codecov flags, components, carry-forward behavior, or repository-specific status rules.
- Uploading HTML reports or workflow artifacts.

## Decisions

- Add `lcov` to Vitest's configured reporters alongside `text`. LCOV is directly supported by Codecov and does not alter the human-readable report used by the step summary.
- Add `codecov/codecov-action` after the coverage test step, pinned to the full commit SHA for v7.1.1 in line with the repository's action-pinning convention.
- Pass `coverage/lcov.info` explicitly and authenticate with the existing `CODECOV_TOKEN` secret. Set `fail_ci_if_error: true` so a broken upload is detected; this is distinct from failing on a coverage percentage.
- Do not add `codecov.yml`. The default Codecov behavior is sufficient for initial visibility, and repository-specific policy would be premature.

## Risks / Trade-offs

- [Codecov or its upload endpoint is unavailable] → The unit-test job fails at the explicit upload step, making loss of the requested reporting visible and retryable.
- [Secrets are unavailable on a fork pull request] → The official action can use Codecov's public-repository fork upload flow; the repository token is not exposed to the fork.
- [LCOV generation adds test overhead and output files] → The report is generated only by `test:coverage`, and CI does not persist it as a workflow artifact.
