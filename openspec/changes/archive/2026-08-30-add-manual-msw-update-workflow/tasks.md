## 1. Focused MSW Generation

- [x] 1.1 Add a dedicated package script that regenerates only the configured MSW service worker
- [x] 1.2 Verify the dedicated generator is idempotent with the currently installed MSW version

## 2. Manual Update Workflow

- [x] 2.1 Add a SHA-pinned, `workflow_dispatch`-only workflow using the repository's Node and pnpm setup conventions
- [x] 2.2 Update MSW, regenerate the worker, enforce the three-file allowlist, and exit successfully on an empty diff
- [x] 2.3 Commit and force-update a stable branch, then create a descriptive PR only when no matching open PR exists
- [x] 2.4 Configure concurrency and only `contents: write` and `pull-requests: write` permissions

## 3. Verification

- [x] 3.1 Validate workflow YAML with syntax parsing, actionlint, and zizmor
- [x] 3.2 Run generation, lint, unit tests, typecheck, and OpenSpec validation
- [x] 3.3 Exercise both the current-version no-op path and an actual MSW update in an isolated worktree, confirming only the three allowlisted files change
- [x] 3.4 Confirm `renovate.json5` and its MSW update rule are unchanged

## 4. Completion

- [x] 4.1 Sync the completed delta spec into the canonical specification and archive the OpenSpec change with `opsx:archive`
