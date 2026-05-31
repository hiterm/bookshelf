## 1. API Version Bump & Type Generation

- [x] 1.1 Update `bookshelf-api.version` from `2.4.1` to `2.5.0`
- [x] 1.2 Run `npm run generate` to fetch the new schema and regenerate `src/generated/graphql-request.ts`
- [x] 1.3 Run `npm run typecheck` and fix any type errors caused by the schema update

## 2. GraphQL Documents & Hooks

- [x] 2.1 Create `src/graphql/bookEvents.graphql` with `bookEvents($bookId: ID!)` query
- [x] 2.2 Create `src/graphql/authorEvents.graphql` with `authorEvents($authorId: ID!)` query
- [x] 2.3 Run `npm run generate` to regenerate SDK with new queries
- [x] 2.4 Create `src/compoments/hooks/useBookEvents.ts` React Query hook
- [x] 2.5 Create `src/compoments/hooks/useAuthorEvents.ts` React Query hook

## 3. Mock Data & MSW Handlers

- [x] 3.1 Add sample `bookEvents` data to `src/mocks/handlers.ts`
- [x] 3.2 Add sample `authorEvents` data to `src/mocks/handlers.ts`
- [x] 3.3 Add `graphqlApi.query("bookEvents", ...)` handler
- [x] 3.4 Add `graphqlApi.query("authorEvents", ...)` handler
- [x] 3.5 Verify demo mode renders history correctly with mock data

## 4. Display Book & Author History

- [x] 4.1 Create `src/features/books/BookHistory.tsx` component to display book event history
- [x] 4.2 Integrate `BookHistory` into `src/routes/books/$id.tsx` below `BookDetailShow`
- [x] 4.3 Create `src/features/authors/AuthorHistory.tsx` component to display author event history
- [x] 4.4 Integrate `AuthorHistory` into `src/routes/authors/$id.tsx` below `AuthorDetailShow`
- [x] 4.5 Format `changedAt` timestamps with `dayjs` in `YYYY/MM/DD HH:mm:ss`

## 5. Testing

- [x] 5.1 Add unit tests for `BookHistory` component
- [x] 5.2 Add unit tests for `AuthorHistory` component
- [x] 5.3 Add E2E test in `e2e-demo-mode` asserting book history visibility
- [x] 5.4 Add E2E test in `e2e-demo-mode` asserting author history visibility
- [x] 5.5 Ensure all tests pass: `npm run test` passes (E2E tests require system dependencies not available in this environment)

## 6. Additional Unit Tests

- [ ] 6.1 Add UPDATE/DELETE operation display tests to `AuthorHistory.test.tsx`
- [ ] 6.2 Add multiple events ordering test (desc by changedAt) to `AuthorHistory.test.tsx`
- [ ] 6.3 Add date format test (`YYYY/MM/DD HH:mm:ss`) to `AuthorHistory.test.tsx`
- [ ] 6.4 Add UPDATE/DELETE operation display tests to `BookHistory.test.tsx`
- [ ] 6.5 Add multiple events ordering test to `BookHistory.test.tsx`
- [ ] 6.6 Add date format test to `BookHistory.test.tsx`
- [ ] 6.7 Add author name resolution test (author IDs mapped to names) to `BookHistory.test.tsx`

## 7. e2e-mock-api Event History Support

- [ ] 7.1 Add `authorEvents` / `bookEvents` arrays to `MockStore`
- [ ] 7.2 Record events on createAuthor/updateAuthor/deleteAuthor/createBook/updateBook/deleteBook
- [ ] 7.3 Add `getAuthorEvents(authorId)` / `getBookEvents(bookId)` methods to `MockStore`
- [ ] 7.4 Add `Query.authorEvents` / `Query.bookEvents` resolvers to `resolvers.ts`

## 8. e2e-integration History Tests

- [ ] 8.1 Add test: author creation shows History heading and CREATE on detail page
- [ ] 8.2 Add test: book creation shows History heading and CREATE on detail page
- [ ] 8.3 Add test: book update shows both CREATE and UPDATE in history

## 9. e2e-mock-api History Tests

- [ ] 9.1 Add test: author creation shows History heading and CREATE on detail page
- [ ] 9.2 Add test: book creation shows History heading and CREATE on detail page
- [ ] 9.3 Add test: book update shows both CREATE and UPDATE in history

## 10. Final Checks

- [ ] 10.1 Run `npm run generate`
- [ ] 10.2 Run `npm run lint:fix`
- [ ] 10.3 Run `npm run typecheck`
- [ ] 10.4 Run `npm run test`
- [ ] 10.5 Commit changes

## 11. Final Checks

- [x] 11.1 Run `npm run lint:fix`
- [x] 11.2 Run `npm run typecheck`
- [x] 11.3 Run `npm run test`
- [x] 11.4 Commit changes
