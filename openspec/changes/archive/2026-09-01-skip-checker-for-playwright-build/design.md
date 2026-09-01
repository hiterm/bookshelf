## Context

Vite registers `vite-plugin-checker` for production builds and already omits it
when `VITEST=true`. Each Playwright suite starts a preview server by first
running a production build, so all three suites currently pay for checker work
that is covered by the standalone typecheck command and normal build path.

## Goals / Non-Goals

**Goals:**

- Provide an explicit package script for builds that omit the checker.
- Keep the checker omission mechanism private to the Vite/package-script layer.
- Move all Playwright web server builds to that script.
- Preserve checker behavior for normal builds, typecheck, and Vitest.

**Non-Goals:**

- Removing or reconfiguring `vite-plugin-checker` globally.
- Changing TypeScript validation or integration-test behavior.
- Adding a dependency solely for environment-variable portability.

## Decisions

- Use `SKIP_VITE_CHECKER=true` as a non-`VITE_` environment variable. It is
  consumed only while evaluating `vite.config.ts`, so it must not be exposed to
  browser code.
- Register the checker only when neither `VITEST` nor `SKIP_VITE_CHECKER` is
  exactly `"true"`. Exact matching preserves the existing opt-out semantics.
- Expose the opt-out as `build:without-check` in `package.json`. Playwright
  configurations invoke the package script and do not know the environment
  variable name.
- Follow the repository's existing shell environment syntax and package-manager
  conventions. Avoid adding `cross-env` unless the existing project already
  requires an equivalent portability mechanism.

## Risks / Trade-offs

- [A developer uses `build:without-check` without separately validating types]
  → Keep the normal `build` and `typecheck` scripts unchanged and scope usage to
  Playwright configuration.
- [Shell assignment syntax is not portable to native Windows command prompts]
  → Follow the project's current Unix-oriented script conventions and avoid an
  otherwise unnecessary dependency.
- [The internal environment variable leaks into test configuration]
  → Assert through review/search that Playwright files contain only the package
  script name.

## Verification Results

- A separate implementation-verification run measured `pnpm build` at 15.96
  seconds locally with the checker enabled.
- The same implementation-verification run measured
  `pnpm build:without-check` at 5.65 seconds locally with the checker omitted.
- `pnpm typecheck`, `pnpm lint`, and `pnpm test`: passed.
- All three Playwright configurations use `build:without-check` and contain no
  reference to `SKIP_VITE_CHECKER`.
- The mock API Playwright web server successfully built through the new script,
  but local E2E execution could not launch because the Playwright Chromium
  executable is not installed. Demo mode also hit the existing 60-second web
  server timeout during a resource-constrained local attempt. Full E2E and
  integration verification is delegated to CI as planned.
