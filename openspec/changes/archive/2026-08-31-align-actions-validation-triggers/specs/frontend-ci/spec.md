## ADDED Requirements

### Requirement: Actions validation runs as pull request checks
The actionlint and zizmor workflows SHALL run for pull request events so that
their results are reported as checks on ordinary and Actions-generated pull
requests after any required workflow approval.

#### Scenario: Ordinary pull request is opened or updated
- **WHEN** a pull request is opened or its branch receives a new commit
- **THEN** actionlint and zizmor run for the pull request revision

#### Scenario: Actions-generated pull request is approved
- **WHEN** a pull request created or updated with `GITHUB_TOKEN` receives any
  required workflow approval
- **THEN** actionlint and zizmor run through the same `pull_request` checks as
  an ordinary pull request

### Requirement: Actions validation runs for main pushes only
The actionlint and zizmor workflows SHALL run for pushes to `main` and SHALL
NOT run directly for ordinary pushes to other branches.

#### Scenario: Commit is pushed to main
- **WHEN** a commit is pushed to `main`
- **THEN** actionlint and zizmor run for that commit

#### Scenario: Commit is pushed to a feature branch
- **WHEN** a commit is pushed to a branch other than `main`
- **THEN** the push event does not directly start CI, actionlint, or zizmor

### Requirement: Actions-generated pull requests use no validation workaround
The repository SHALL rely on standard pull request events and SHALL NOT add a
release-PR-specific or updater-PR-specific validation dispatch workaround.

#### Scenario: Workflow-generated pull request requires approval
- **WHEN** GitHub marks workflows for an Actions-generated pull request as
  requiring approval
- **THEN** the repository preserves that approval gate instead of dispatching
  validation through another event
