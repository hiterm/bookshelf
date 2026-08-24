## Context

bookshelf already displays entity-scoped BookEvent and AuthorEvent history. The API also exposes `eventSets` and `eventSet(id)`, where each EventSet represents one logical operation and groups its resulting book and author events. The new UI spans GraphQL documents, generated clients and mocks, React Query hooks, routes, navigation, reusable presentation components, and all three E2E environments. The API has no EventSet pagination and is not changed in this work.

## Goals / Non-Goals

**Goals:**
- Let users browse logical operations and inspect their grouped event snapshots.
- Remain usable for large imports by loading the EventSet once while initially collapsing individual event details.
- Tolerate unknown operation strings, nullable snapshots, absent EventSets, and empty histories.
- Preserve the existing authenticated SDK, routing, UI, mocking, and testing conventions.

**Non-Goals:**
- Pagination, searching, filtering, EventSet deletion, restoration, or editing.
- Operation-specific renderers or strong frontend typing for `extra`.
- Links that probe whether affected books or authors still exist.
- Replacing or integrating the existing entity-scoped history UI.
- Changes to bookshelf-api or an ExecPlan.

## Decisions

1. **Use two focused GraphQL documents and thin React Query hooks.** The list query requests only `id`, `operation`, and `createdAt`; the detail query requests complete BookEvent and AuthorEvent snapshots. Hooks return generated SDK responses without presentation mapping. This matches existing data access patterns and avoids introducing a parallel repository layer. A single oversized query was rejected because list navigation does not need event snapshots.

2. **Treat operation values as open strings at the presentation boundary.** A centralized helper maps currently known EventSet operations to Japanese labels and returns the raw value for unknown operations. Event operations follow the same fallback policy. A closed TypeScript enum was rejected because API additions would otherwise break rendering before the frontend is updated.

3. **Use accessible, vertical navigation items for the list.** Each item is a router link styled with Mantine rather than a clickable `div` or table row. This provides native keyboard behavior and a clear accessible name while fitting narrow screens better than a wide table.

4. **Separate event kinds and collapse snapshots by default.** BookEvent and AuthorEvent sections use Mantine Accordions whose summaries contain the operation and the best available entity label. Expanded panels render stable field/value rows with `-` for nullish values. This keeps imports with many events scannable while retaining complete snapshots on demand.

5. **Render `extra` as optional, nested disclosure.** Non-null values appear under an "追加情報" control as pretty-printed JSON, independent of primary fields. This avoids coupling the UI to an evolving JSON schema. Null values render no extra-information control.

6. **Model history in each existing test environment at its own boundary.** Unit/component tests cover labels and presentation. Mock API and Demo Mode fixtures support deterministic navigation flows using their existing isolated MockStore mechanisms. Integration creates a representative real mutation and verifies the resulting EventSet through the UI, without re-testing all backend grouping rules.

## Risks / Trade-offs

- **[Unbounded list response can grow]** → Render the API-provided list directly for now and keep pagination explicitly out of scope until the API supports it.
- **[Large details still transfer every event eagerly]** → Collapse rendering by default; future API pagination can address network size if real usage requires it.
- **[Unknown operations have less friendly labels]** → Display the raw value so history remains visible and diagnosable rather than failing or hiding data.
- **[`extra` may contain deeply nested or unexpected JSON]** → Pretty-print it in an isolated preformatted block and do not derive core UI behavior from it.
- **[Demo fixtures can drift from the API schema]** → Generate GraphQL mock types and cover the real contract in the integration suite.
