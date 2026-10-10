## Context

Lists, details and revision caches have independent keys. Book responses embed
live author fields; author details embed authored books. Operations list is
append-only; existing operation details contain immutable snapshots. #402 and
#411 already fix book update/merge associations and atomic-save directory updates.

## Goals / Non-Goals

**Goals:** Refresh active dependent consumers after successful domain writes,
keep rejected-write data and explicit retry, and make mutation dependencies
reviewable through a feature-owned matrix and helpers.

**Non-Goals:** Global invalidation/removal, generic CRUD abstractions, API changes,
new packages, rewrites of existing tests or historical reports, or test settings.

## Decisions

Use explicit feature-owned invalidation functions and history's operations-list
helper. Preserve existing targets and non-awaited onSuccess timing. Add missing
book list/detail and author revisions for rename, author detail family for book
deletion, author list/details for import, and operations list for all writes.
Responses do not enumerate all affected book/author IDs; detail-family refresh
avoids relying on incomplete cached associations. Retain immutable operation and
book-revision snapshots when a live author is renamed.

Extend existing real-QueryClient tests rather than duplicating #402. Mock only
token/SDK boundaries; keep observers mounted, infinite stale time and automatic
mount/focus/reconnect refresh disabled. Compare immutable server responses and
operation history. Rename/import failures await rejection and prove error state,
retained data, no history change and a subsequent successful retry. Existing
book-update failure/retry remains protected. Group remaining directory/book
writes in a sequential history case rather than blanket hook coverage.

## Risks / Trade-offs

Detail-family invalidation may refetch unrelated details within the same domain;
this is bounded and needed because mutation responses omit relationship IDs.
Write completion does not await all refetches, preserving existing UI timing.
Refetch failures retain previous data; cross-client pushes and response-loss
idempotency remain outside scope. Typed SDK tests protect frontend cache
behavior; browser suites and real-backend CI protect their distinct boundaries.
