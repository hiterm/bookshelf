## 1. PR-Centered CI Triggers

- [x] 1.1 Restrict frontend CI push events to `main`, add the `pull_request` trigger, and remove `workflow_dispatch`

## 2. MSW Workflow Handoff

- [x] 2.1 Remove the explicit frontend CI dispatch step and the `actions: write` permission while preserving all update and PR behavior

## 3. Validation

- [x] 3.1 Run the required local generation, lint, unit test, and typecheck checks without running frontend integration tests
- [x] 3.2 Inspect the final workflow diff and validate the OpenSpec change
