## ADDED Requirements

### Requirement: jsdom tests use the VM threads pool

The frontend SHALL run the shared jsdom-based Vitest suite with the
`vmThreads` pool so workers reuse the jsdom runtime while each test file keeps
an isolated VM context. The configuration SHALL retain Vitest's default
file-level parallelism.

#### Scenario: Run the frontend test suite

- **WHEN** contributors or CI run the shared Vitest configuration
- **THEN** Vitest uses the `vmThreads` pool with the existing jsdom environment
  and setup file

#### Scenario: Preserve file-level isolation

- **WHEN** test files mutate DOM globals or declare module mocks
- **THEN** each test file runs in its own isolated VM context rather than
  sharing file state
