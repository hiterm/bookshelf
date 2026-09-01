## 1. Build Configuration

- [x] 1.1 Add the internal checker opt-out to the Vite plugin condition while preserving the Vitest condition
- [x] 1.2 Add the `build:without-check` package script without changing normal build or typecheck scripts

## 2. Playwright Configuration

- [x] 2.1 Update mock API Playwright web server build to use `build:without-check`
- [x] 2.2 Update demo mode Playwright web server build to use `build:without-check`
- [x] 2.3 Update integration Playwright web server build to use `build:without-check`

## 3. Verification

- [x] 3.1 Verify normal and checker-free builds have the intended checker behavior
- [x] 3.2 Run typecheck, lint, and unit tests
- [x] 3.3 Confirm all three Playwright configurations hide the checker environment variable and use the dedicated build script
