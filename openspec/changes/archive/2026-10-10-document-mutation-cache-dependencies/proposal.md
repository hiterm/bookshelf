## Why

Issue #406 item 2 identifies stale related caches after successful writes. Main
`63b9865` already includes #402's update/merge contracts and #411's atomic saves,
but author rename, book deletion, import and operation history still omit active
consumers. Navigation/focus refresh can hide these omissions.

## What Changes

- Document every books/authors/history mutation dependency and its key family.
- Refresh book names/details and author revisions after author updates, author
  book associations after book deletion, authors after import, and operations
  after every successful domain write.
- Organize invalidation by feature and preserve failure/retry and existing save
  semantics without clearing caches.
- Extend real-hook regression coverage with concurrently subscribed consumers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-query-organization`: Explicit successful-write cache dependencies
  and corrections to the original reorganization-only preservation contract.

## Impact

Feature API hooks, their invalidation helpers, active-cache tests and architecture
documentation. No API operations, dependencies, worker/timeout/coverage settings
or unrelated refactoring changes. Historical investigation and archives remain
unchanged.
