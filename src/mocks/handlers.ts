import { graphql, HttpResponse } from "msw";
import type { ImportBookInput } from "../generated/graphql-request";
import { mockStore } from "./mockStore";

const graphqlApi = graphql.link("/api/graphql");

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isImportBookInput(v: unknown): v is ImportBookInput {
  return (
    isObject(v) &&
    isString(v.title) &&
    Array.isArray(v.authorNames) &&
    v.authorNames.every(isString) &&
    isString(v.isbn) &&
    typeof v.read === "boolean" &&
    typeof v.owned === "boolean" &&
    typeof v.priority === "number" &&
    isString(v.format) &&
    isString(v.store)
  );
}

function resolveBookAuthors(book: { authorIds: string[] }) {
  return book.authorIds
    .map((id) => mockStore.getAuthor(id))
    .filter((author): author is NonNullable<typeof author> => author !== null)
    .map((author) => ({ __typename: "Author", ...author }));
}

export const handlers = [
  graphqlApi.query("loggedInUser", () => {
    return HttpResponse.json({
      data: mockStore.isUserRegistered()
        ? { loggedInUser: { id: "test-user-id" } }
        : { loggedInUser: null },
    });
  }),

  graphqlApi.query("operations", () => {
    return HttpResponse.json({
      data: { operations: mockStore.getOperations() },
    });
  }),

  graphqlApi.query("operation", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.id)) {
      return HttpResponse.json({ errors: [{ message: "Invalid variables" }] });
    }
    return HttpResponse.json({
      data: { operation: mockStore.getOperation(variables.id) },
    });
  }),

  graphqlApi.query("authors", () => {
    const authors = mockStore.getAllAuthors().map((author) => ({
      __typename: "Author",
      ...author,
    }));
    return HttpResponse.json({
      data: { authors },
    });
  }),

  graphqlApi.query("author", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.authorId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const author = mockStore.getAuthor(variables.authorId);
    if (author == null) {
      return HttpResponse.json({
        data: { author: null },
      });
    }
    return HttpResponse.json({
      data: {
        author: {
          __typename: "Author",
          ...author,
          books: mockStore
            .getAllBooks()
            .filter((book) => book.authorIds.includes(author.id))
            .map((book) => ({ __typename: "Book" as const, ...book })),
        },
      },
    });
  }),

  graphqlApi.query("books", () => {
    const books = mockStore.getAllBooks().map((book) => ({
      __typename: "Book",
      ...book,
      authors: resolveBookAuthors(book),
    }));
    return HttpResponse.json({
      data: { books },
    });
  }),

  graphqlApi.query("book", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.bookId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const book = mockStore.getBook(variables.bookId);
    if (book == null) {
      return HttpResponse.json({
        data: { book: null },
      });
    }
    return HttpResponse.json({
      data: {
        book: {
          __typename: "Book",
          ...book,
          authors: resolveBookAuthors(book),
        },
      },
    });
  }),

  graphqlApi.query("bookRevisions", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.bookId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: { bookRevisions: mockStore.getBookRevisions(variables.bookId) },
    });
  }),

  graphqlApi.query("authorRevisions", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.authorId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        authorRevisions: mockStore.getAuthorRevisions(variables.authorId),
      },
    });
  }),

  graphqlApi.query("bookRevision", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isString(variables.bookId) ||
      typeof variables.revisionNumber !== "number"
    ) {
      return HttpResponse.json({ errors: [{ message: "Invalid variables" }] });
    }
    return HttpResponse.json({
      data: {
        bookRevision:
          mockStore
            .getBookRevisions(variables.bookId)
            .find(
              (revision) =>
                revision.revisionNumber === variables.revisionNumber,
            ) ?? null,
      },
    });
  }),

  graphqlApi.query("authorRevision", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isString(variables.authorId) ||
      typeof variables.revisionNumber !== "number"
    ) {
      return HttpResponse.json({ errors: [{ message: "Invalid variables" }] });
    }
    return HttpResponse.json({
      data: {
        authorRevision:
          mockStore
            .getAuthorRevisions(variables.authorId)
            .find(
              (revision) =>
                revision.revisionNumber === variables.revisionNumber,
            ) ?? null,
      },
    });
  }),

  graphqlApi.mutation("registerUser", () => {
    mockStore.registerUser();
    return HttpResponse.json({
      data: { registerUser: { id: "test-user-id" } },
    });
  }),

  graphqlApi.mutation("createAuthor", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isObject(variables.authorData) ||
      !isString(variables.authorData.name)
    ) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const yomi = isString(variables.authorData.yomi)
      ? variables.authorData.yomi
      : "";
    const author = mockStore.createAuthor(variables.authorData.name, yomi);
    return HttpResponse.json({
      data: {
        createAuthor: {
          author: {
            __typename: "Author",
            ...author,
          },
        },
      },
    });
  }),

  graphqlApi.mutation("updateAuthor", ({ variables }) => {
    if (!isObject(variables) || !isObject(variables.authorData)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const { authorData } = variables;
    if (!isString(authorData.id) || !isString(authorData.name)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const yomi = isString(authorData.yomi) ? authorData.yomi : "";
    const author = mockStore.updateAuthor(authorData.id, authorData.name, yomi);
    if (author == null) {
      return HttpResponse.json(
        { errors: [{ message: `Author not found: ${authorData.id}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        updateAuthor: {
          author: {
            __typename: "Author",
            ...author,
          },
        },
      },
    });
  }),

  graphqlApi.mutation("deleteAuthor", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.authorId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const deleted = mockStore.deleteAuthor(variables.authorId);
    if (!deleted) {
      return HttpResponse.json(
        { errors: [{ message: `Author not found: ${variables.authorId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: { deleteAuthor: { authorId: variables.authorId } },
    });
  }),

  graphqlApi.mutation("mergeAuthor", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isString(variables.sourceAuthorId) ||
      !isString(variables.destinationAuthorId)
    ) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const result = mockStore.mergeAuthor(
      variables.sourceAuthorId,
      variables.destinationAuthorId,
    );
    if (result == null) {
      return HttpResponse.json({
        errors: [{ message: "Authors cannot be merged" }],
      });
    }
    return HttpResponse.json({
      data: {
        mergeAuthor: {
          __typename: "MergeAuthorPayload",
          author: { __typename: "Author", ...result.author },
          operationId: result.operationId,
        },
      },
    });
  }),

  graphqlApi.mutation("createBook", ({ variables }) => {
    if (!isObject(variables) || !isObject(variables.bookData)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const { bookData } = variables;
    if (
      !isString(bookData.title) ||
      !Array.isArray(bookData.authorIds) ||
      !bookData.authorIds.every(isString) ||
      !isString(bookData.isbn) ||
      typeof bookData.read !== "boolean" ||
      typeof bookData.owned !== "boolean" ||
      typeof bookData.priority !== "number" ||
      !isString(bookData.format) ||
      !isString(bookData.store)
    ) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const book = mockStore.createBook({
      title: bookData.title,
      authorIds: bookData.authorIds,
      isbn: bookData.isbn,
      read: bookData.read,
      owned: bookData.owned,
      priority: bookData.priority,
      format: bookData.format,
      store: bookData.store,
    });
    return HttpResponse.json({
      data: {
        createBook: {
          book: {
            __typename: "Book",
            ...book,
            authors: resolveBookAuthors(book),
          },
        },
      },
    });
  }),

  graphqlApi.mutation("updateBook", ({ variables }) => {
    if (!isObject(variables)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const bookData = variables.bookData;
    if (!isObject(bookData)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    if (!isString(bookData.id)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const bookId = bookData.id;
    const update: Parameters<typeof mockStore.updateBook>[0] = { id: bookId };
    if (isString(bookData.title)) update.title = bookData.title;
    if (
      Array.isArray(bookData.authorIds) &&
      bookData.authorIds.every(isString)
    ) {
      update.authorIds = bookData.authorIds;
    }
    if (isString(bookData.isbn)) update.isbn = bookData.isbn;
    if (typeof bookData.read === "boolean") update.read = bookData.read;
    if (typeof bookData.owned === "boolean") update.owned = bookData.owned;
    if (typeof bookData.priority === "number")
      update.priority = bookData.priority;
    if (isString(bookData.format)) update.format = bookData.format;
    if (isString(bookData.store)) update.store = bookData.store;
    const book = mockStore.updateBook(update);
    if (book == null) {
      return HttpResponse.json(
        { errors: [{ message: `Book not found: ${bookId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        updateBook: {
          book: {
            __typename: "Book",
            ...book,
            authors: resolveBookAuthors(book),
          },
        },
      },
    });
  }),

  graphqlApi.mutation("deleteBook", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.bookId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const deleted = mockStore.deleteBook(variables.bookId);
    if (!deleted) {
      return HttpResponse.json(
        { errors: [{ message: `Book not found: ${variables.bookId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: { deleteBook: { bookId: variables.bookId } },
    });
  }),

  graphqlApi.mutation("importBooks", ({ variables }) => {
    if (
      !isObject(variables) ||
      !Array.isArray(variables.books) ||
      !variables.books.every(isImportBookInput)
    ) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const result = mockStore.importBooks(variables.books);
    return HttpResponse.json({
      data: {
        importBooks: {
          operationId: result.operationId,
          books: result.books.map((book) => ({
            __typename: "Book",
            ...book,
            authors: resolveBookAuthors(book),
          })),
        },
      },
    });
  }),

  graphqlApi.mutation("previewBookImport", ({ variables }) => {
    if (
      !isObject(variables) ||
      !Array.isArray(variables.books) ||
      !variables.books.every(isImportBookInput)
    ) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        previewBookImport: mockStore.previewBookImport(variables.books),
      },
    });
  }),

  graphqlApi.mutation("restoreBook", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isString(variables.bookId) ||
      typeof variables.revisionNumber !== "number"
    ) {
      return HttpResponse.json({ errors: [{ message: "Invalid variables" }] });
    }
    const result = mockStore.restoreBook(
      variables.bookId,
      variables.revisionNumber,
    );
    if (result == null) {
      return HttpResponse.json({
        errors: [{ message: "Book revision not found" }],
      });
    }
    return HttpResponse.json({ data: { restoreBook: result } });
  }),

  graphqlApi.mutation("restoreAuthor", ({ variables }) => {
    if (
      !isObject(variables) ||
      !isString(variables.authorId) ||
      typeof variables.revisionNumber !== "number"
    ) {
      return HttpResponse.json({ errors: [{ message: "Invalid variables" }] });
    }
    const result = mockStore.restoreAuthor(
      variables.authorId,
      variables.revisionNumber,
    );
    if (result == null) {
      return HttpResponse.json({
        errors: [{ message: "Author revision not found" }],
      });
    }
    return HttpResponse.json({ data: { restoreAuthor: result } });
  }),
];
