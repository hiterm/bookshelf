## Context

`BookEdit` resolves pending authors and then updates the book. `AuthorEdit` performs one update. Both already report failures, but neither guards concurrent submissions. `AddBookButton` uses a synchronous ref lock plus React state for this purpose.

## Goals / Non-Goals

**Goals:** Keep each edit to one in-flight submission, show that saving is in progress, and restore a retryable form after failure.

**Non-Goals:** Change the author resolution algorithm or solve partial success across multiple pending authors (#404).

## Decisions

- Use a ref for the immediate guard and state for button `disabled` and `loading`, following `AddBookButton`. A state-only guard can miss two submissions before React renders.
- Acquire the lock at the start of the validated submit callback and release it in `finally`, covering author resolution, update, and navigation. Keep existing error reporting by operation.
- Preserve existing form values on failure. After successful author resolution, replace pending authors with their created IDs before updating the book, so an update retry does not recreate them.
- Keep the logic in each component because the two flows are small and a shared abstraction would obscure the book's two-stage error handling.

## Risks / Trade-offs

- A pending author creation may partly succeed before another fails. The existing resolver does not return partial results; #404 owns that recovery behavior.
- If navigation never settles, the button remains locked. This matches the meaning of an in-flight save and is released if navigation rejects.

## Migration Plan

No data migration. Revert the component changes to restore prior behavior.

## Open Questions

None for this scope.
