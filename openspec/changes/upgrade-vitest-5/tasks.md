## 1. Migration Audit

- [ ] 1.1 Confirm the latest stable Vitest 5.x release and prerequisite versions
- [ ] 1.2 Audit Vitest 5 breaking changes against repository usage

## 2. Dependency and Test Setup

- [ ] 2.1 Upgrade Vitest and regenerate the pnpm lockfile
- [ ] 2.2 Add the shared Vitest jest-dom setup and configure setupFiles
- [ ] 2.3 Remove generic jest-dom imports from individual test files
- [ ] 2.4 Update current test-environment documentation

## 3. Verification

- [ ] 3.1 Confirm no direct generic jest-dom imports or affected deprecated APIs remain
- [ ] 3.2 Run frozen installation, checks, unit/component tests, and production build
