## Context

The import editor stores candidate identity as the original array index. `visibleBooks` retains that index after date filtering, while `selectedIndexes` and `splitAuthors` are `Set<number>` values. `updateVisibleSelection` already updates a Set for a supplied subset without affecting other indexes. The desktop editor is an 8:4 Mantine Grid with sticky settings; on mobile it stacks, placing Preview after the full table. Preview actions currently follow every preview card.

The application uses Mantine AppShell with a 70px header and a 300px desktop navbar. Any fixed action must remain within the AppShell main content area, avoid overlays, reserve document space, and account for `env(safe-area-inset-bottom)`.

## Goals / Non-Goals

**Goals:**

- Apply author splitting to all and only filtered visible candidates, then allow individual exceptions.
- Keep primary actions reachable on long mobile editor lists and all preview lists.
- Reuse one small import-specific action bar and retain desktop input layout and settings behavior.
- Preserve preview invalidation and mutation busy-state semantics.

**Non-Goals:**

- Changing candidate index identity, filtering, selection semantics, API inputs, or backend behavior.
- Fixing the settings form itself to the viewport on mobile.
- Redesigning the desktop input editor or adding detailed summaries to fixed bars.

## Decisions

The page will reuse `updateVisibleSelection` for `splitAuthors`, passing the original indexes from `visibleBooks`. This mirrors visible selection, preserves hidden state, and avoids a second Set-update abstraction. The handler will invalidate preview consistently with individual split changes. A bulk action may invalidate even when the resulting Set is equal, matching the existing visible-selection handler and causing no user-visible loss while the editor is active.

A `BookImportActionBar` component will own the fixed `Paper` and compact `Group` layout, accept action content as children, and expose a mobile-only option for the editor. Its CSS will use Mantine breakpoint mixins or responsive styles plus AppShell CSS variables so desktop left positioning accounts for the navbar and mobile spans the main viewport. The bar will use a restrained z-index below overlay layers and safe-area padding.

The input page will render the bar only below the desktop breakpoint with `対象 N冊` and Preview, wired to the same `runPreview` handler and disabled/loading conditions as settings. The preview will always render a fixed bar with Back and `N冊をインポート`, while its regular summary stays in document flow. Both pages will add bottom padding matching the bar height so final content remains visible.

The editor will use one responsive CSS Grid with source, settings, and books areas. Below the desktop breakpoint those areas appear as source, settings, then books so filtering and bulk controls within the books area follow settings; at the desktop breakpoint source and books share the left column while settings spans the right column. The single settings instance is normal-flow on mobile and sticky only on desktop, avoiding duplicated form controls or state.

Tests will assert behavior through accessible names and mutation payloads. A mock-API Playwright scenario will cover bulk splitting through preview and import, and a mobile viewport scenario will verify the fixed preview action is usable without scrolling to settings.

## Risks / Trade-offs

- [AppShell offsets differ by breakpoint] → Use AppShell CSS variables and a breakpoint-specific left edge rather than hard-coded viewport widths.
- [A fixed bar can cover final content or mobile browser controls] → Reserve page bottom padding and include safe-area inset padding.
- [Duplicate Preview buttons can diverge] → Bind both to the same handler and derive disabled/loading state from the same values.
- [Long translated labels can crowd small screens] → Keep the bar to count plus primary actions and allow compact grouping without detailed summaries.

## Migration Plan

This is a frontend-only additive change with no data migration. Deploy with the existing application bundle. Rollback consists of reverting the new component and its call sites; stored import data and APIs remain compatible.

## Open Questions

None. Existing AppShell variables and Mantine responsive APIs will be confirmed against repository styles during implementation.
