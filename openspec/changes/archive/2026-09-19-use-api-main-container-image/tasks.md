## 1. Specification

- [x] 1.1 Define API `main` image compatibility semantics in `frontend-ci`

## 2. Workflow

- [x] 2.1 Remove API checkout, Rust setup, cache restore, and source build
- [x] 2.2 Pull and start the API `:main` image while logging its digest
- [x] 2.3 Preserve frontend setup, dependencies, readiness, and fixed-release integration

## 3. Verification

- [x] 3.1 Run required frontend checks, OpenSpec validation, workflow syntax, and actionlint without local integration E2E

## 4. Specification lifecycle

- [x] 4.1 Sync the delta spec into canonical specifications and archive the completed change
