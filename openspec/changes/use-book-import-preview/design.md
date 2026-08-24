## Context

The import dialog parses Kindle JSON in the browser, filters candidates by an
inclusive purchase-date range, and lets users select books before calling
`importBooks`. That candidate display does not reflect backend normalization.
The backend now exposes `previewBookImport` with the same
`ImportBookInput[]` contract as `importBooks` and returns normalized books plus
author resolution without persisting changes.

This change crosses generated GraphQL code, authenticated mutation hooks,
dialog state and rendering, error reporting, mock infrastructure, and browser
tests. Preview is advisory because database state can change before import.

## Goals / Non-Goals

**Goals:**

- Require a successful backend preview before import becomes available.
- Show backend-normalized book data and existing/new author resolution.
- Guarantee within the frontend that import receives the exact input array
  captured for the successful preview.
- Invalidate stale previews whenever any input-affecting UI state changes.
- Preserve candidate inputs after failures so users can retry or revise them.
- Prevent overlapping file reads, previews, imports, and input edits.

**Non-Goals:**

- Changing the backend GraphQL schema or import implementation.
- Reserving database state or guaranteeing preview/import result equality.
- Reconstructing import input from the preview response.
- Introducing a general-purpose workflow state machine.

## Decisions

### Capture preview input as authoritative import input

The preview handler builds `ImportBookInput[]` once from the currently selected
and visible candidates, passes that array to `previewBookImport`, and retains
the same array as `previewedInputs` only on success. The import handler passes
`previewedInputs` directly to `importBooks` and never rebuilds it from current
UI state or the preview response. This gives a simple referential guarantee
inside the frontend without implying that backend state is frozen.

An alternative was comparing newly built inputs with previewed inputs at
import time. That adds equality and normalization concerns while providing a
weaker guarantee than retaining the original value.

### Invalidate preview at input mutation boundaries

A shared invalidation action clears both preview response and
`previewedInputs`. File selection/clearing, purchase-date changes, individual
selection, select-all, and clear-all invoke it when not busy. This explicit
boundary approach is easier to audit than deriving preview validity through a
deep comparison effect and prevents transient renders with stale confirmation.

`runPreview` also invalidates the retained response and input before starting
every preview attempt and again when an attempt fails. Therefore, a failed
re-preview cannot leave an older successful preview authorized for import; the
user must obtain a new successful preview.

### Keep candidate and backend preview displays separate

The checkbox list remains the editable candidate list. A distinct
"インポート内容" section renders normalized backend results and author
resolution labels. The preview action remains available after success as a
re-preview action.

### Reuse existing mutation and error patterns

`usePreviewBookImport` obtains an access token and calls the generated SDK in
the same manner as `useImportBooks`, but it does not invalidate queries because
preview is non-persistent. Both mutation failures are reported through
`AppErrorProvider`; only successful import invalidates `books`, resets dialog
state, and closes the dialog.

### Extend mocks without preview writes

Mock handlers return the preview contract, including normalized book fields and
author `EXISTING`/`NEW` status, without mutating `MockStore`. Import remains the
only operation that changes mock book state. This preserves Demo Mode browser
context isolation and per-test MockStore isolation in the mock API suite.

## Risks / Trade-offs

- **Preview can differ from import after concurrent database changes** → Label
  and treat preview as advisory; import always invokes the real backend path.
- **A missed input mutation could leave import enabled for stale data** → Route
  every input-affecting handler through explicit preview invalidation and cover
  each mutation class with component tests.
- **Generated schema contract may differ from the anticipated fields** → Define
  the operation from the checked-in backend schema and run code generation and
  type checking before implementing display logic.
- **Busy-state controls can regress existing file-read behavior** → Include
  file read, preview pending, and import pending in one busy predicate while
  retaining stale-read and duplicate-submit regression tests.
- **Integration environment may not expose the new backend mutation** → Add the
  minimal integration happy path when supported and document any verified
  environment limitation rather than weakening mock/component coverage.
