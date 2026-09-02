## Context

Production history components parse UTC instants and format them through
`dayjs(timestamp).format(...)`, which intentionally uses the runtime's local
timezone. Two unit tests instead expect literal UTC wall-clock text, so the
assertions disagree with production behavior when the test process uses JST.

## Goals / Non-Goals

**Goals:**

- Assert the existing local-time rendering behavior in a timezone-portable way.
- Keep expected timestamps readable and consistent between affected tests.
- Demonstrate portability by running unit tests under UTC and Asia/Tokyo.

**Non-Goals:**

- Changing production formatting or establishing a product timezone policy.
- Configuring a global timezone for Vitest or adding Day.js plugins.
- Changing unrelated date-boundary behavior such as Kindle import.

## Decisions

- Add a small test-only helper that formats a supplied UTC instant with Day.js
  using the same format string as the rendered history timestamps. This derives
  the expected wall-clock text from the process's actual local timezone while
  keeping the fixture instant explicit at each assertion.
- Use the helper only in assertions that currently hard-code the UTC rendering.
  A production formatter abstraction would expand the change without improving
  runtime behavior, while duplicating inline Day.js calls would obscure intent.
- Search adjacent tests for the same literal UTC assumption, but modify only
  assertions affected by the same local-time rendering contract.

## Risks / Trade-offs

- [The helper could mirror a formatting defect in production] → Keep component
  behavior assertions focused on the explicit fixture instant and exact display
  format; the purpose of these tests is rendering integration, not Day.js itself.
- [A shared test helper may be over-generalized later] → Keep its API narrow and
  name it for local timestamp display expectations.

