## 1. Shared test configuration

- [x] 1.1 Remove `fileParallelism: false` from `vite.config.ts` without
      changing other Vitest pool, isolation, worker, timeout, or project settings
- [x] 1.2 Add the environment-specific test settings policy to `AGENTS.md`

## 2. Validation

- [x] 2.1 Run generation, checks, unit tests, type checking, and the production
      build required by the repository
- [x] 2.2 Confirm local parallel execution does not require weakening test
      assertions or shared timeout settings
