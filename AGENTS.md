# Agent Guidelines

> **Note:** `CLAUDE.md` is a symlink to this file (`AGENTS.md`). Edit `AGENTS.md` directly.

## Commit Rules

### Language

- All commit messages must be written in **English**

### Format (50/72 Rule)

- **Title**: Maximum 50 characters
- **Body** (if needed): Wrap at 72 characters
- Use present tense ("Add feature" not "Added feature")

### Commit Granularity

- Make commits in **meaningful units**
- **Separate renames from edits** - do not combine file renaming with content changes
- **Commit early and often** - make commits at logical breakpoints instead of batching all changes at the end
- Example of good separation:

  ```text
  1. Rename User.ts to UserModel.ts
  2. Update UserModel.ts to add email validation
  ```

## Code Style

- Follow existing conventions in the codebase
- Use existing libraries and utilities
- Never introduce code that exposes or logs secrets
- Prefer `value == null` and `value != null` for nullish checks when `null`
  and `undefined` do not need to be distinguished. Use strict equality only
  when the distinction is meaningful.
- When ignoring a linter or security tool finding, always add a comment
  explaining why it is safe to ignore. Place the comment on the line immediately
  before the ignore directive.

## Environment / Tooling Restrictions

- **Never modify `.npmrc` or global npm config** (e.g., `before`, `registry`, `min-release-age`).
  If `npm install` fails due to a config issue, report it to the user and ask for permission
  rather than changing settings yourself.

- Do not change `before`, `registry`, or `min-release-age` settings under any circumstances.
  If it is absolutely necessary, you must obtain permission from the user before proceeding.

## Branching (REQUIRED FIRST STEP)

Before doing ANY work — including investigation that may lead to code
changes — check the current branch. If on `main`, create a feature branch
**before editing any files or running npm install**:

```bash
git checkout -b <type>/<short-description>
```

Never commit directly to `main`.

## Git Commands

- Always use `git --no-pager` for git commands to avoid opening a pager
- Example: `git --no-pager log`, `git --no-pager diff`, `git --no-pager status`

## GitHub CLI Authentication

When running as Codex, do not immediately conclude that GitHub CLI is
unauthenticated when a `gh` command fails with an authentication or
network-related error. Sandbox restrictions can cause misleading failures.

Retry the required command with escalated sandbox permissions first. Only ask
the user to re-authenticate when the authentication failure also occurs outside
the sandbox.

## Pull Requests

- When a pull request already exists for the current branch, update its
  description after making code changes.
  - Keep the PR description consistent with the final implementation,
    including the summary, notable design decisions, and test results.
  - Use `gh pr edit --body-file <file>` or the GitHub integration to avoid
    shell quoting issues.

## Communication

- Be concise and direct
- Think and work in **English**
- Use the same language as the user for confirmations and final reports

## Testing Policy

- When implementing a new feature, always add or update tests appropriate to
  the change.
- Use Vitest (`pnpm run test`) to test logic, hooks, and component behavior.
- Use Playwright E2E tests to test critical user flows and interactions across
  screens.
- Choose E2E suites according to their purpose:
  - Use `e2e-mock-api` (`pnpm run test:e2e:mock-api`) for flows with a mocked
    API.
  - Use `e2e-demo-mode` (`pnpm run test:e2e:demo-mode`) for Demo Mode behavior.
  - Use `e2e-integration` (`pnpm run test:integration`) for integration with the
    real backend.
- Test types are not substitutes for one another. Test the same feature at
  multiple layers or in multiple E2E suites when they cover different
  responsibilities, execution environments, integration boundaries, or
  failure modes. Do not mechanically duplicate identical assertions.
- When fixing a bug, add a reproducible regression test whenever possible.

## E2E Test Isolation

This project has three E2E test suites with different isolation mechanisms:

**`e2e-mock-api`** — MockStore lives in the **Node.js (Playwright) process**.
Each test gets a fresh `MockStore` instance via the `mockStore` Playwright
fixture (`e2e-mock-api/fixtures.ts`), which has default `"test"` scope.
`page.route()` handlers capture the per-test store via closure.
Browser context isolation is not the primary mechanism here.

**`e2e-demo-mode`** — MockStore lives in the **browser service worker**
(`src/mocks/mockStore.ts`) as a module-level singleton
(`export const mockStore = new MockStore()`).
There is no explicit reset between tests. Isolation comes from Playwright's
default behavior of creating a new `BrowserContext` per test: each context
registers a fresh service worker, which reloads the module and re-initializes
the singleton.

**`e2e-integration`** — Tests use the **real backend**. The Playwright `page`
fixture (`e2e-integration/fixtures.ts`) generates a unique user ID for each
page. The suite is configured to run serially with one worker to avoid
conflicts in shared backend state.

## Testing Mantine Components

When writing tests for Mantine components, refer to these docs as needed:

- Jest/Vitest setup: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/jest.mdx
- Testing Select/MultiSelect (combobox): https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/combobox-testing.mdx
- Testing Modal/Drawer/Popover (portals): https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/portals-testing.mdx

### Pre-commit (mandatory, no exceptions)

Before every `git commit`, run the following and fix any
failures before proceeding:

```bash
pnpm run generate   # Regenerate GraphQL types, MSW worker, and route tree
ppnpm run lint:fix   # Auto-fix ESLint and Biome format issues
pnpm run test       # Run unit tests
pnpm run typecheck  # Run TypeScript type checking
```

Never skip these unless the user explicitly instructs you to, or
the changes are documentation-only (in which case only `pnpm run lint:fix`
is required).

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.agent/PLANS.md`) from design to implementation.

Store all ExecPlan files in `.agent/plans/`. Name each file with a `yyyymmdd-` prefix (the creation date) followed by a short kebab-case description of the task (e.g. `.agent/plans/20251001-add-auth-flow.md`). Always use the creation date, even for long-running tasks.

## File Formatting

- **Trailing newlines**: All files must end with a newline character
- Use your editor's settings to ensure trailing newlines are added automatically
- This prevents "No newline at end of file" warnings in git diffs
