import { graphql, HttpResponse } from "msw";
import { mockStore } from "./mockStore";

const graphqlApi = graphql.link("/api/graphql");

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
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
    if (!author) {
      return HttpResponse.json({
        data: { author: null },
      });
    }
    return HttpResponse.json({
      data: {
        author: {
          __typename: "Author",
          ...author,
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
    if (!book) {
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
    const author = mockStore.createAuthor(variables.authorData.name);
    return HttpResponse.json({
      data: {
        createAuthor: {
          __typename: "Author",
          ...author,
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
    const author = mockStore.updateAuthor(authorData.id, authorData.name);
    if (!author) {
      return HttpResponse.json(
        { errors: [{ message: `Author not found: ${authorData.id}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        updateAuthor: {
          __typename: "Author",
          ...author,
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
      data: { deleteAuthor: variables.authorId },
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
          __typename: "Book",
          ...book,
          authors: resolveBookAuthors(book),
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
    if (!book) {
      return HttpResponse.json(
        { errors: [{ message: `Book not found: ${bookId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: {
        updateBook: {
          __typename: "Book",
          ...book,
          authors: resolveBookAuthors(book),
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
      data: { deleteBook: variables.bookId },
    });
  }),
];
