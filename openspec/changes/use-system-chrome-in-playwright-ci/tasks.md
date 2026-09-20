## 1. Configure Playwright Browser Selection

- [ ] 1.1 Configure all three Playwright projects to use the `chrome` channel
      only when `isCi` is true.

## 2. Remove CI Browser Installation

- [ ] 2.1 Remove the Playwright Chromium installation step from the four E2E
      jobs without changing their remaining setup or test commands.

## 3. Validate the Change

- [ ] 3.1 Run OpenSpec validation and lightweight frontend and workflow checks.
- [ ] 3.2 Verify all four Playwright jobs in GitHub Actions and compare key job
      durations with the recorded baseline.
