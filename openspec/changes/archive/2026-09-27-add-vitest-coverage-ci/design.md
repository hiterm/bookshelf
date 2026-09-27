## Context

The CI `test` job currently runs `pnpm run test`, and Vitest has no coverage provider configured. GitHub Actions supports a Markdown step summary, while Vitest's text coverage reporter already provides the requested aggregate and per-file metrics plus uncovered line numbers.

## Goals / Non-Goals

**Goals:**

- Measure coverage for frontend source files during the existing CI unit-test job.
- Keep the detailed text table visible in the ordinary step log and repeat it in the GitHub Actions step summary.
- Include untested application source files so the report does not overstate coverage by listing only loaded modules.
- Preserve test failures as CI failures while leaving coverage percentages informational.

**Non-Goals:**

- Enforcing coverage thresholds.
- Publishing coverage to an external service.
- Producing HTML, LCOV, JSON, or persisted workflow artifacts.
- Changing the local default `pnpm run test` command or any E2E suite.

## Decisions

### Use Vitest's V8 provider and text reporter

Add the version-matched `@vitest/coverage-v8` package and a dedicated `test:coverage` script. Configure only the `text` coverage reporter so Vitest prints the aggregate and per-file Statements, Branches, Functions, Lines, and uncovered lines table without generating report files. V8 avoids an additional source instrumentation transform and is the native Vitest coverage path for the current Node runtime.

The alternative Istanbul provider adds instrumentation overhead without providing a benefit for this text-only report. Third-party reporting actions and services are excluded by requirement.

### Scope coverage to maintained frontend TypeScript sources

Use an explicit `src/**/*.{ts,tsx}` include so unimported production files appear in the report. Exclude test files, test support, generated GraphQL/router files, and declaration files because they are either test infrastructure, generated artifacts, or contain no executable application behavior. Mock application modules remain in scope because they implement Demo Mode behavior maintained in this repository.

### Render the Vitest table as preformatted step-summary text

The CI step pipes test output through `tee`, preserving the normal log while retaining a temporary copy. After the test succeeds, it extracts the coverage table and appends it inside a fenced text block under a `Vitest coverage` heading in `$GITHUB_STEP_SUMMARY`. The runner's temporary file is neither uploaded nor committed.

The alternative of writing the whole test output to the summary is noisier, while hand-building a Markdown table would duplicate Vitest's report formatting and parsing logic.

## Risks / Trade-offs

- [The text table can become wide as paths or uncovered-line lists grow] → Use a fenced block so GitHub preserves alignment and provides horizontal scrolling where needed.
- [Piping can accidentally mask a test failure] → Rely on the GitHub Actions bash invocation's `pipefail` behavior so a failing Vitest process still fails the step.
- [Explicit source exclusions can become stale] → Keep exclusions limited to stable generated and test-support path conventions already present in the repository.
