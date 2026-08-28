import type { MockStore } from "./mockStore";

export const createResolvers = (mockStore: MockStore) => ({
  Query: {
    loggedInUser: () =>
      mockStore.isUserRegistered() ? { id: "test-user-id" } : null,
    authors: () => mockStore.getAllAuthors(),
    author: (_: unknown, { id }: { id: string }) => mockStore.getAuthor(id),
    books: () => mockStore.getAllBooks(),
    book: (_: unknown, { id }: { id: string }) => mockStore.getBook(id),
    authorRevisions: (_: unknown, { authorId }: { authorId: string }) =>
      mockStore.getAuthorRevisions(authorId),
    authorRevision: (
      _: unknown,
      {
        authorId,
        revisionNumber,
      }: { authorId: string; revisionNumber: number },
    ) =>
      mockStore
        .getAuthorRevisions(authorId)
        .find((revision) => revision.revisionNumber === revisionNumber) ?? null,
    bookRevisions: (_: unknown, { bookId }: { bookId: string }) =>
      mockStore.getBookRevisions(bookId),
    bookRevision: (
      _: unknown,
      { bookId, revisionNumber }: { bookId: string; revisionNumber: number },
    ) =>
      mockStore
        .getBookRevisions(bookId)
        .find((revision) => revision.revisionNumber === revisionNumber) ?? null,
    operations: () => mockStore.getOperations(),
    operation: (_: unknown, { id }: { id: string }) =>
      mockStore.getOperation(id),
  },
  Mutation: {
    registerUser: () => {
      mockStore.registerUser();
      return { id: "test-user-id" };
    },
    createAuthor: (
      _: unknown,
      { authorData }: { authorData: { name: string; yomi?: string | null } },
    ) => ({
      author: mockStore.createAuthor(authorData.name, authorData.yomi ?? ""),
    }),
    updateAuthor: (
      _: unknown,
      {
        authorData,
      }: { authorData: { id: string; name: string; yomi?: string | null } },
    ) => {
      const updated = mockStore.updateAuthor(
        authorData.id,
        authorData.name,
        authorData.yomi ?? "",
      );
      if (updated == null) {
        throw new Error(`Author not found: ${authorData.id}`);
      }
      return { author: updated };
    },
    deleteAuthor: (_: unknown, { authorId }: { authorId: string }) => {
      const deleted = mockStore.deleteAuthor(authorId);
      if (!deleted) {
        throw new Error(`Author not found: ${authorId}`);
      }
      return { authorId };
    },
    mergeAuthor: (
      _: unknown,
      {
        sourceAuthorId,
        destinationAuthorId,
      }: { sourceAuthorId: string; destinationAuthorId: string },
    ) => {
      const result = mockStore.mergeAuthor(sourceAuthorId, destinationAuthorId);
      if (result == null) throw new Error("Authors cannot be merged");
      return result;
    },
    createBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.createBook>[0] },
    ) => ({ book: mockStore.createBook(bookData) }),
    importBooks: (
      _: unknown,
      { books }: { books: Parameters<typeof mockStore.importBooks>[0] },
    ) => mockStore.importBooks(books),
    previewBookImport: (
      _: unknown,
      { books }: { books: Parameters<typeof mockStore.previewBookImport>[0] },
    ) => mockStore.previewBookImport(books),
    updateBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.updateBook>[0] },
    ) => {
      const updated = mockStore.updateBook(bookData);
      if (updated == null) {
        throw new Error(`Book not found: ${bookData.id}`);
      }
      return { book: updated };
    },
    deleteBook: (_: unknown, { bookId }: { bookId: string }) => {
      const deleted = mockStore.deleteBook(bookId);
      if (!deleted) {
        throw new Error(`Book not found: ${bookId}`);
      }
      return { bookId };
    },
    restoreBook: (
      _: unknown,
      { bookId, revisionNumber }: { bookId: string; revisionNumber: number },
    ) => {
      const result = mockStore.restoreBook(bookId, revisionNumber);
      if (result == null) throw new Error("Book revision not found");
      return result;
    },
    restoreAuthor: (
      _: unknown,
      {
        authorId,
        revisionNumber,
      }: { authorId: string; revisionNumber: number },
    ) => {
      const result = mockStore.restoreAuthor(authorId, revisionNumber);
      if (result == null) throw new Error("Author revision not found");
      return result;
    },
  },
  Book: {
    authors: (book: { authorIds: string[] }) => {
      return book.authorIds
        .map((id) => mockStore.getAuthor(id))
        .filter(
          (author): author is NonNullable<typeof author> => author !== null,
        );
    },
  },
  Author: {
    books: (author: { id: string }) =>
      mockStore
        .getAllBooks()
        .filter((book) => book.authorIds.includes(author.id)),
  },
});
