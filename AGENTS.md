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

## Communication

- Be concise and direct
- Think and work in **English**
- Use the same language as the user for confirmations and final reports

## Pre-commit Checklist

Before committing changes, always run the following commands to ensure code quality:

```bash
npm run test       # Run unit tests
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint and Biome checks
```

All checks must pass before committing.