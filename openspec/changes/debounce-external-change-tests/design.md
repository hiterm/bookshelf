## Context

The hook cancels its timeout on dependency changes and unmount. StringFilter synchronizes its draft from the committed column value in an effect. Existing BookList Reset tests first complete the draft debounce; the route-change test has no pending input and never advances past a debounce deadline.

## Goals / Non-Goals

**Goals:** Exercise pending edits against external actions using real BookList, table, router, and debounce behavior. Check the input, rendered rows, and search state after the old deadline and any subsequent synchronization debounce.

**Non-Goals:** Rewrite the hook, mock timer internals, change timing policy, or silently fix production defects discovered by this investigation.

## Decisions

- Keep hook coverage unchanged unless the audit identifies a missing hook contract; cancellation already has direct tests.
- Extend BookList tests with controlled clocks enabled before render. Use distinct committed, draft, and externally supplied values so stale writes are observable.
- Include Reset with and without a previously committed string filter: the latter may leave the committed value unchanged despite the user's cancellation intent.
- Use browser history coverage for actual Back/Forward behavior if component coverage alone cannot establish it.
- Report a reproducible failure with its cause before deciding production follow-up. Avoid assertions about timer counts or private table state.

## Risks / Trade-offs

- Fake timers can interfere with router scheduling → advance within async React act and restore timers in finally.
- A test can pass before stale work executes → explicitly cross the old and replacement deadlines before final assertions.
- A newly exposed bug may need a separate production decision → preserve the reproduction and report it first.

## Investigation results and authorized remedy

The new component tests reproduce one failure: type a title while the URL has no title filter, then Reset before 1000 ms. The committed value stays undefined, so StringFilter's synchronization effect does not run and its old draft later updates the URL and list. Reset from an existing committed title, external search replacement, and both history directions pass after their debounce deadlines.

The Chromium mock-API regression also reproduces the retained draft after Reset. Hook tests already cover cancellation on unmount and dependency changes, so no additional hook-only tests are needed.

The user requested an intentionally failing test commit followed by a separate fix commit. Reset increments a local key in BookList and passes it to BookTable's filter controls. Only the controls remount, clearing drafts and letting existing effect cleanup cancel pending timers. The table instance, rows, visibility, and scroll container retain their identities. Ordinary URL synchronization continues to use the existing StringFilter behavior.

An explicit cancellation API in the generic hook or threading reset state into StringFilter would add broader coordination for this Reset-specific defect. Keying only filter controls is smaller and uses React's existing lifecycle contract. Tests re-query displayed inputs after Reset so they do not depend on preserving DOM node identities.
