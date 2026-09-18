## Context

Oxlint already checks the frontend with TypeScript type information and strict
categories. Function return types are presently inferred. This policy affects
many source and test modules, so the initial lint output must guide the edits.

## Goals / Non-Goals

**Goals:** Make function contracts explicit, keep inline callbacks concise, and
preserve the existing lint and TypeScript return-path policies.

**Non-Goals:** Change runtime behavior, generated code, historical records, or
the `typescript/consistent-return` setting.

## Decisions

- Configure `typescript/explicit-function-return-type` as `error` with only
  `allowExpressions: true`. This retains contextual typing for inline
  callbacks while keeping declarations and exported functions explicit.
- Run lint with the new rule before editing functions. Select return types
  based on each function's contract: `React.JSX.Element` for components,
  `Promise<T>` for asynchronous work, `void` for effects, and existing domain
  types for data. Extract a named type when a returned object needs one.
- Keep `typescript/consistent-return` disabled and use TypeScript's
  `noImplicitReturns` for return-path checking.
- Prefer local fixes for unusual violations. Any additional global option or
  local disable requires an explained, concrete case.

## Risks / Trade-offs

- [Large annotation diff] → Limit edits to types and necessary named type
  definitions; verify with lint, typecheck, tests, formatting, and check.
- [Incorrectly narrowed return contract] → Use typecheck and inspect inferred
  values and consumers before choosing each return type.
