# Atomic book saves

Book creation and editing send one mutation containing existing `authorIds` and
`newAuthorNames` (default empty). The backend saves new authors, the book,
relationships and operation history in one transaction. A failed request leaves
no partial authors or history. Exact duplicate new names are collapsed; names
are not normalized. Existing names cause a conflict instead of silent reuse.

GraphQL errors with `code: CONFLICT` and `reason: AUTHOR_NAME_CONFLICT` trigger a
fresh author query. Recovery replaces only pending selections still matching
the submitted ID and exact name, preserving intervening edits/removals. Existing
IDs are deduplicated. The notification names the replacements and says the book
is still unsaved. The user explicitly saves again; no write is retried
automatically. If refresh fails or no match remains, keep inputs and report the
original save error. Other conflicts never trigger author replacement.

Successful mutations invalidate book and author caches and the operations list,
as documented in [mutation-cache-dependencies.md](mutation-cache-dependencies.md).
MockStore and Demo Mode
also roll back intermediate author/history changes on failure and combine all
changes into the book operation. The server's response-loss/idempotency problem
is outside this contract: a lost response does not prove rollback.

Release the API before deploying the frontend. During coordinated development,
use GRAPHQL_SCHEMA_PATH to generate types from the modified API. The frontend
PR must remain blocked until its backend dependency is available.
