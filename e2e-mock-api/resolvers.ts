import type { MockStore } from "./mockStore";

export const createResolvers = (mockStore: MockStore) => ({
  Query: {
    loggedInUser: () =>
      mockStore.isUserRegistered() ? { id: "test-user-id" } : null,
    authors: () => mockStore.getAllAuthors(),
    author: (_: unknown, { id }: { id: string }) => mockStore.getAuthor(id),
    books: () => mockStore.getAllBooks(),
    book: (_: unknown, { id }: { id: string }) => mockStore.getBook(id),
  },
  Mutation: {
    registerUser: () => {
      mockStore.registerUser();
      return { id: "test-user-id" };
    },
    createAuthor: (
      _: unknown,
      { authorData }: { authorData: { name: string } },
    ) => mockStore.createAuthor(authorData.name),
    updateAuthor: (
      _: unknown,
      { authorData }: { authorData: { id: string; name: string } },
    ) => {
      const updated = mockStore.updateAuthor(authorData.id, authorData.name);
      if (!updated) {
        throw new Error(`Author not found: ${authorData.id}`);
      }
      return updated;
    },
    deleteAuthor: (_: unknown, { authorId }: { authorId: string }) => {
      const deleted = mockStore.deleteAuthor(authorId);
      if (!deleted) {
        throw new Error(`Author not found: ${authorId}`);
      }
      return authorId;
    },
    createBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.createBook>[0] },
    ) => mockStore.createBook(bookData),
    updateBook: (
      _: unknown,
      { bookData }: { bookData: Parameters<typeof mockStore.updateBook>[0] },
    ) => mockStore.updateBook(bookData),
    deleteBook: (_: unknown, { bookId }: { bookId: string }) => {
      const deleted = mockStore.deleteBook(bookId);
      if (!deleted) {
        throw new Error(`Book not found: ${bookId}`);
      }
      return bookId;
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
});
