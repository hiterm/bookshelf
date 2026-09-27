## 1. Vitest Coverage Configuration

- [x] 1.1 Add the version-matched V8 coverage provider and a dedicated coverage test script.
- [x] 1.2 Configure the text-only coverage report and maintained frontend source scope without thresholds.

## 2. GitHub Actions Reporting

- [x] 2.1 Run unit tests with coverage in CI while preserving the detailed report in the step log.
- [x] 2.2 Add the coverage table to the GitHub Actions step summary without uploading or persisting report files.

## 3. Verification

- [x] 3.1 Verify the coverage command reports aggregate and per-file metrics with uncovered lines and does not generate HTML.
- [x] 3.2 Run the required repository validation, excluding the local frontend integration suite.
