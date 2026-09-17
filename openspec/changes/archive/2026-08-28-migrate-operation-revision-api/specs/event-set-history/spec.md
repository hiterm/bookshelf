## REMOVED Requirements

### Requirement: Browse operation-oriented change history
**Reason**: Backend PR #324 removes EventSet queries and replaces them with Operations.
**Migration**: Use the `operation-history` capability backed by `operations` and `operation(id)`.

### Requirement: Change history is available from primary navigation
**Reason**: Navigation behavior now belongs to the Operation-based replacement capability.
**Migration**: Preserve `/history` through the `operation-history` capability.

### Requirement: Operations remain readable as the API evolves
**Reason**: EventSet and event operation strings no longer exist in the backend contract.
**Migration**: Render the new Operation `type` with the equivalent fallback behavior.

### Requirement: Inspect events grouped by logical operation
**Reason**: EventSet details and BookEvent/AuthorEvent collections are removed.
**Migration**: Render Operation bookChanges and authorChanges with before/after Revisions.

### Requirement: Event snapshots are disclosed on demand
**Reason**: Entity snapshots are represented by Revisions rather than Events.
**Migration**: Disclose beforeRevision and afterRevision snapshots for each OperationChange.

### Requirement: Extra event data is secondary and schema-independent
**Reason**: Event `extra` is removed and operation metadata is represented by Operation `detail`.
**Migration**: Display non-null Operation detail as formatted JSON.
