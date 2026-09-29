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
