# frontend-function-return-contracts Specification

## Purpose

Define the frontend lint policy for explicit function return contracts while
preserving contextual typing and existing return-path checks.

## Requirements

### Requirement: Function declarations expose return contracts

The frontend SHALL enforce explicit return types for function declarations
through Oxlint's `typescript/explicit-function-return-type` rule at error level.

#### Scenario: A function declaration lacks a return type

- **WHEN** lint checks a non-ignored TypeScript function declaration without a
  return type annotation
- **THEN** lint reports an error

### Requirement: Contextually typed expressions remain concise

The frontend SHALL allow function expressions and arrow functions used
directly as callbacks to use their contextual return type without an explicit
annotation. Functions directly assigned to variables, exported as defaults,
or defined as class properties SHALL require an explicit return type.

#### Scenario: An inline callback relies on contextual typing

- **WHEN** lint checks a function expression used as an inline callback
- **THEN** the return-type rule does not require an annotation

#### Scenario: A function expression is bound to a variable

- **WHEN** lint checks a function expression directly assigned to a variable
  without a return type annotation
- **THEN** lint reports an error

### Requirement: Existing return-path and ignore policies remain in force

The frontend SHALL keep `typescript/consistent-return` disabled, use
TypeScript's `noImplicitReturns` for return-path checks, and preserve the
existing Oxlint categories and generated-code ignore patterns.

#### Scenario: Lint and typecheck run after policy adoption

- **WHEN** the standard lint and typecheck commands run
- **THEN** return-type enforcement applies without weakening existing checks
