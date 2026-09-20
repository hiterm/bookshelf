## 1. Shared test configuration

- [ ] 1.1 Remove `fileParallelism: false` from `vite.config.ts` without
      changing other Vitest pool, isolation, worker, timeout, or project settings
- [ ] 1.2 Add the environment-specific test settings policy to `AGENTS.md`

## 2. Validation

- [ ] 2.1 Run generation, checks, unit tests, type checking, and the production
      build required by the repository
- [ ] 2.2 Confirm local parallel execution does not require weakening test
      assertions or shared timeout settings

## 3. CI evaluation

- [ ] 3.1 Create the pull request and verify all GitHub Actions checks complete
- [ ] 3.2 Record the Vitest duration, test-job duration,
      `BookList.test.tsx` duration, test counts, and stability compared with the
      documented baseline
- [ ] 3.3 Request CodeRabbit review after CI passes and resolve actionable
      feedback until approval
