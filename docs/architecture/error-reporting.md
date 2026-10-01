# Error reporting

`AppErrorProvider` owns persistent errors and transient failure notifications.
QueryCache reports each failed query request. Query UI uses `LocalError` for a
contextual title and `normalizeError(error).message`; rendering has no reporting
side effects. Never serialize or log raw query errors, because a GraphQL
ClientError includes request information.

The UI that owns a mutation operation calls `reportError` in its catch or
mutation error callback. Shared API hooks and MutationCache must not also report
those failures. This also applies to composed operations such as creating authors
before saving a book: the owning book UI reports the failed operation once.
Input validation remains local and does not call `reportError`.

Keep safe normalization shared between local display and persistent inspection.
Local errors show only the normalized message. Persistent details and clipboard
text may include the normalizer's safe technical details, never full requests or
arbitrary object serialization.
