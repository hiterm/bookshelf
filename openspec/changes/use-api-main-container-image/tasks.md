## 1. Specification

- [x] 1.1 Define API `main` image compatibility semantics in `frontend-ci`

## 2. Workflow

- [ ] 2.1 Remove API checkout, Rust setup, cache restore, and source build
- [ ] 2.2 Pull and start the API `:main` image while logging its digest
- [ ] 2.3 Preserve frontend setup, dependencies, readiness, and fixed-release integration

## 3. Verification

- [ ] 3.1 Run required frontend checks, OpenSpec validation, workflow syntax, and actionlint without local integration E2E
- [ ] 3.2 Open a pull request and verify the hosted integration job and duration
- [ ] 3.3 Obtain CodeRabbit approval and address valid findings

## 4. Specification lifecycle

- [ ] 4.1 Sync the delta spec into canonical specifications and archive the completed change
