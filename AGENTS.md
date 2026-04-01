# Agent Guidelines

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
- No comments unless explicitly requested
- Never introduce code that exposes or logs secrets

## Git Commands

- Always use `git --no-pager` for git commands to avoid opening a pager
- Example: `git --no-pager log`, `git --no-pager diff`, `git --no-pager status`
- Never work directly on the `main` branch — always create a feature branch

## Communication

- Be concise and direct
- Think and work in **English**
- Use the same language as the user for confirmations and final reports

## Pre-commit Checklist

Before committing changes, always run the following commands to ensure code quality:

```bash
npm run generate   # Regenerate GraphQL types from .graphql files
npm run test       # Run unit tests
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint and Biome checks
```

All checks must pass before committing.

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.agent/PLANS.md`) from design to implementation.

Store all ExecPlan files in `.agent/plans/`. Name each file with a `yyyymmdd-` prefix (the creation date) followed by a short kebab-case description of the task (e.g. `.agent/plans/20251001-add-auth-flow.md`). Always use the creation date, even for long-running tasks.

## File Formatting

- **Trailing newlines**: All files must end with a newline character
- Use your editor's settings to ensure trailing newlines are added automatically
- This prevents "No newline at end of file" warnings in git diffs
