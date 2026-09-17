## 1. Implementation

- [x] 1.1 Set both `BooleanValue` `ThemeIcon` roots to `span` without changing
  presentation or behavior
- [x] 1.2 Review every `BooleanValue` consumer for reliance on a block-level
  root and leave callers unchanged when safe

## 2. Regression Coverage

- [x] 2.1 Add focused true and false tests that render `BooleanValue` inside a
  paragraph and assert a `span` root without coupling to icon internals

## 3. Validation

- [x] 3.1 Run focused tests, typecheck, lint, and the full unit test suite
- [x] 3.2 Confirm the final diff preserves appearance and removes invalid
  paragraph nesting for both boolean values

## 4. Specification Completion

- [x] 4.1 Record validation completion and prepare the delta spec for sync and
  archive
