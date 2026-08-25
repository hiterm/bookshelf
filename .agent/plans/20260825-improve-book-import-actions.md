# Improve Book Import actions

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept current while implementation proceeds. It follows `.agent/PLANS.md` from the repository root.

## Purpose / Big Picture

People importing many Kindle books should be able to establish a default author-splitting choice for the books currently on screen, adjust only exceptions, and reach Preview or Import without traversing a long list. After this change, the desktop editor still looks and behaves like the existing 8:4 layout, while mobile input and every preview provide compact viewport-bottom primary actions.

## Progress

- [x] (2026-08-25 00:00Z) Updated `main` to `531405b` and created `feature/improve-book-import-actions`.
- [x] (2026-08-25 00:05Z) Created the OpenSpec proposal, design, and delta specification.
- [x] (2026-08-25 14:55Z) Created OpenSpec implementation tasks and confirmed 4/4 artifacts are apply-ready.
- [x] (2026-08-25 15:02Z) Implemented visible-only bulk author splitting and component tests.
- [x] (2026-08-25 15:02Z) Implemented the responsive shared action bar and component tests.
- [x] (2026-08-25 15:02Z) Extended mock-API end-to-end coverage, including a mobile viewport.
- [x] (2026-08-25 15:12Z) Ran generation, lint fixing, 199 unit tests, type checking, and two focused Book Import E2E tests successfully.
- [ ] Synchronize and archive the OpenSpec change, commit, push, open the PR, and wait for all CI including integration.

## Surprises & Discoveries

- Observation: The requested baseline `531405b` became the latest `origin/main` during setup.
  Evidence: `git pull --ff-only origin main` advanced local main to `531405b`, and `git log -1` identified merge PR #336.
- Observation: Mantine AppShell exposes the responsive main-content offset as `--app-shell-navbar-offset` and its configured padding as `--app-shell-padding`.
  Evidence: Mantine's installed `AppShell.module.css` calculates main inline padding from these variables, allowing the fixed bar to share the same edges.

## Decision Log

- Decision: Extend the existing `book-import` capability rather than create a new capability.
  Rationale: Bulk author interpretation and reachable actions refine the existing import workflow contract and use the same page state and mutations.
  Date/Author: 2026-08-25 / Codex
- Decision: Reuse `updateVisibleSelection` for the `splitAuthors` Set.
  Rationale: It already preserves indexes outside a supplied visible subset and keeps candidate identity unchanged.
  Date/Author: 2026-08-25 / Codex
- Decision: Give the mobile Preview button a distinct accessible name while keeping its visible text `プレビュー`.
  Rationale: CSS breakpoint hiding leaves both desktop and mobile buttons in the test DOM; the distinct name keeps automation deterministic and explicitly targets the fixed action.
  Date/Author: 2026-08-25 / Codex

## Outcomes & Retrospective

Core implementation and local validation are complete. Specification archival, delivery, and CI remain.

## Context and Orientation

`src/features/books/import/BookImportPage.tsx` owns raw candidates, the purchase-date filter, selected candidate indexes, per-book author-splitting indexes, preview state, and mutations. It derives `visibleBooks` as objects containing each candidate and its original array index. `src/features/books/import/importSelection.ts` exports `updateVisibleSelection`, which clones a Set and adds or removes supplied indexes.

`src/features/books/import/BookImportTable.tsx` displays visible candidates and their individual selection and `カンマで分割` controls. `src/features/books/import/BookImportSettings.tsx` is the sticky desktop settings panel containing Preview. `src/features/books/import/BookImportPreview.tsx` renders the normalized preview and currently places Back and Import after all books. Mantine AppShell supplies CSS variables for the 70px header and responsive 300px navbar; a fixed bar must stay inside the main content area. A safe area is the mobile OS-reserved screen edge represented in CSS by `env(safe-area-inset-bottom)`.

## Plan of Work

First add a bulk split callback to `BookImportTable` and wire it in `BookImportPage` using original visible indexes and `updateVisibleSelection`. Add tests proving enable, disable, hidden preservation, individual override, preview invalidation, and final authorNames payload.

Next create `src/features/books/import/BookImportActionBar.tsx` as a small Mantine Paper/Group wrapper with fixed positioning, responsive AppShell offsets, modest stacking order, and safe-area padding. Render a mobile-only instance from the editor with the selected count and Preview. Render an all-viewport instance from Preview with Back and a count-aware Import label. Add page bottom padding only while its fixed bar is present and retain all busy/loading semantics.

Finally update `e2e-mock-api/books.spec.ts` for the representative bulk split through import flow and add a narrow viewport assertion showing Preview can be activated without scrolling to the settings panel. Run all required local checks except real-backend integration, synchronize the delta specification, archive the change, commit and push. Open a main-targeting PR with the requested summary and validation notes, then inspect and repair CI until every job, including integration, succeeds.

## Concrete Steps

Run commands from `/home/hiterm/ghq/github.com/hiterm/bookshelf`. Use `openspec instructions apply --change improve-book-import-actions --json` before implementation. During validation run `pnpm run generate`, `pnpm run lint:fix`, `pnpm run test`, `pnpm run typecheck`, and the focused `pnpm run test:e2e:mock-api` command or supported file filter. Do not run `pnpm run test:integration` locally. Before each non-documentation commit, repeat all mandatory pre-commit commands.

After tasks are complete, compare `openspec/changes/improve-book-import-actions/specs/book-import/spec.md` with `openspec/specs/book-import/spec.md`, merge the added requirements into the canonical spec, and archive to `openspec/changes/archive/2026-08-25-improve-book-import-actions/`. Push the branch, create a PR to `main`, and use GitHub CLI checks to wait for completion.

## Validation and Acceptance

Vitest must show that bulk splitting changes only visible indexes, individual controls remain effective, preview is invalidated by split changes, preview mutation author names match the current state, preview buttons include the target count, busy preview actions are disabled, and the mobile-only action visibility is encoded testably. Playwright mock-API must complete bulk split, Preview, and Import and must demonstrate at a mobile viewport that the fixed Preview action is visible and operable at the top of a long list. All generation, lint, unit, typecheck, and relevant E2E commands must exit zero. GitHub Actions, including integration, must finish successfully.

## Idempotence and Recovery

Set updates clone current state, so repeating a bulk operation is safe. Generation, formatting, tests, spec synchronization, and CI inspection can be rerun. If a mutation or E2E test fails, preserve the branch and working tree, diagnose from focused output, repair, and rerun required pre-commit checks. Never reset user work or change npm registry/configuration. Archive only after confirming the target directory does not exist.

## Artifacts and Notes

The OpenSpec change lives at `openspec/changes/improve-book-import-actions/`. The confirmed base is:

    531405b Merge pull request #336 from hiterm/feature/generalize-book-import

## Interfaces and Dependencies

`BookImportTable` will accept `onSplitVisible(split: boolean): void`. `BookImportPage` will calculate visible original indexes and update `splitAuthors` through `updateVisibleSelection`. `BookImportActionBar` will accept normal React content and a display mode sufficient to hide the editor instance at Mantine's `md` breakpoint. It will use only existing Mantine and CSS facilities; no package dependency or GraphQL schema changes are allowed.

Revision note (2026-08-25): Initial plan created from the approved requirements and the current `531405b` source layout.

Revision note (2026-08-25 15:02Z): Recorded completed implementation milestones, Mantine variable discovery, and the accessible-name testing decision.

Revision note (2026-08-25 15:12Z): Recorded successful full local validation and focused E2E results.
