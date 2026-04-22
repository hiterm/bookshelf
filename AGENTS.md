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
- When ignoring a linter or security tool finding, always add a comment
  explaining why it is safe to ignore. Place the comment on the line immediately
  before the ignore directive.
- **Do not use `as` type assertions** (e.g. `foo as SomeType`). Use proper
  type narrowing or type guards instead. `as const` is allowed.

## Branching (REQUIRED FIRST STEP)

Before doing ANY work, check the current branch. If on `main`, create a
feature branch first:

```bash
git checkout -b <type>/<short-description>
```

Never commit directly to `main`.

## Git Commands

- Always use `git --no-pager` for git commands to avoid opening a pager
- Example: `git --no-pager log`, `git --no-pager diff`, `git --no-pager status`

## Communication

- Be concise and direct
- Think and work in **English**
- Use the same language as the user for confirmations and final reports

## Testing Policy

- When implementing a new feature, always implement tests for it.

## Testing Mantine Components

When writing tests for Mantine components, refer to these docs as needed:

- Jest/Vitest setup: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/jest.mdx
- Testing Select/MultiSelect (combobox): https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/combobox-testing.mdx
- Testing Modal/Drawer/Popover (portals): https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/portals-testing.mdx

### Pre-commit (mandatory, no exceptions)

Before every `git commit`, run the following and fix any
failures before proceeding:

```bash
npm run generate   # Regenerate GraphQL types and MSW worker
npm run test       # Run unit tests
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint and Biome checks
```

Never skip these unless the user explicitly instructs you to, or
the changes are documentation-only (in which case only `npm run lint`
is required).

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.agent/PLANS.md`) from design to implementation.

Store all ExecPlan files in `.agent/plans/`. Name each file with a `yyyymmdd-` prefix (the creation date) followed by a short kebab-case description of the task (e.g. `.agent/plans/20251001-add-auth-flow.md`). Always use the creation date, even for long-running tasks.

## File Formatting

- **Trailing newlines**: All files must end with a newline character
- Use your editor's settings to ensure trailing newlines are added automatically
- This prevents "No newline at end of file" warnings in git diffs
