## Context

Book creation and both edit forms currently maintain `isSubmitting` for the
button and a synchronous ref for the handler. The edit spec describes all
further submit events, which includes synchronous re-entry before React renders.
The intended interaction is a user pressing Save again while an earlier save is
still in progress.

## Goals / Non-Goals

**Goals:** Use one React state value per form to cover the complete save flow,
disable and show loading on the submit button, and allow retry after failure.

**Non-Goals:** Guarantee against synchronous programmatic submit re-entry,
combine author and book mutations, or change partial author creation recovery.

## Decisions

- Remove each `submittingRef` and check `isSubmitting` at the start of the
  validated submit callback. Keep the button disabled and loading from the same
  state. React flushes state updates from one intentional user action before
  the next, so a second button click cannot start another save.
- Keep `isSubmitting` independent of mutation `isPending`: book flows include
  author resolution plus book mutation, and edits include navigation. This
  avoids restructuring API hooks solely to simplify the guard.
- Keep `finally` release and the existing error handling. Successful author
  resolution continues to update form values so a failed book mutation can be
  retried without recreating the author.
- Exercise the supported button interaction in tests, including each pending
  stage and retry. Remove tests that depend on direct programmatic form submit
  as a specified guarantee.

## Risks / Trade-offs

- Synchronous programmatic submit events before React renders can start more
  than one save. This is outside the UI behavior required by the revised spec.
- A save that never settles keeps the button disabled. This matches the
  existing full-flow busy behavior.

## Migration Plan

No data migration. Update all three forms and tests in one source commit. The
OpenSpec delta is synchronized when the change is archived.
