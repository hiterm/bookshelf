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

function getBookEvents(bookId: string) {
  if (bookId === "book-1") {
    return [
      {
        __typename: "BookEventEntry" as const,
        eventId: "book-event-2",
        eventSetId: "event-set-2",
        operation: "UPDATE",
        bookId: "book-1",
        title: "テスト書籍1（更新）",
        authorIds: ["author-1"],
        isbn: "978-4-00-000001-0",
        read: true,
        owned: true,
        priority: 60,
        format: "PRINTED",
        store: "UNKNOWN",
        bookCreatedAt: 1609459200,
        bookUpdatedAt: 1609545600,
        changedAt: 1609545600,
        extra: null,
      },
      {
        __typename: "BookEventEntry" as const,
        eventId: "book-event-1",
        eventSetId: "event-set-1",
        operation: "CREATE",
        bookId: "book-1",
        title: "テスト書籍1",
        authorIds: ["author-1"],
        isbn: "978-4-00-000001-0",
        read: false,
        owned: true,
        priority: 50,
        format: "PRINTED",
        store: "UNKNOWN",
        bookCreatedAt: 1609459200,
        bookUpdatedAt: 1609459200,
        changedAt: 1609459200,
        extra: null,
      },
    ];
  }
  if (bookId === "book-2") {
    return [
      {
        __typename: "BookEventEntry" as const,
        eventId: "book-event-3",
        eventSetId: "event-set-3",
        operation: "CREATE",
        bookId: "book-2",
        title: "テスト書籍2",
        authorIds: ["author-2"],
        isbn: "978-4-00-000002-7",
        read: true,
        owned: true,
        priority: 80,
        format: "E_BOOK",
        store: "KINDLE",
        bookCreatedAt: 1609632000,
        bookUpdatedAt: 1609632000,
        changedAt: 1609632000,
        extra: null,
      },
    ];
  }
  return [];
}

function getAuthorEvents(authorId: string) {
  if (authorId === "author-1") {
    return [
      {
        __typename: "AuthorEventEntry" as const,
        eventId: "author-event-1",
        eventSetId: "event-set-1",
        operation: "CREATE",
        authorId: "author-1",
        name: "著者1",
        yomi: null,
        authorCreatedAt: 1609459200,
        authorUpdatedAt: 1609459200,
        changedAt: 1609459200,
        extra: null,
      },
    ];
  }
  if (authorId === "author-2") {
    return [
      {
        __typename: "AuthorEventEntry" as const,
        eventId: "author-event-2",
        eventSetId: "event-set-2",
        operation: "CREATE",
        authorId: "author-2",
        name: "著者2",
        yomi: null,
        authorCreatedAt: 1609545600,
        authorUpdatedAt: 1609545600,
        changedAt: 1609545600,
        extra: null,
      },
    ];
  }
  return [];
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

  graphqlApi.query("bookEvents", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.bookId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const events = getBookEvents(variables.bookId);
    return HttpResponse.json({
      data: { bookEvents: events },
    });
  }),

  graphqlApi.query("authorEvents", ({ variables }) => {
    if (!isObject(variables) || !isString(variables.authorId)) {
      return HttpResponse.json(
        { errors: [{ message: "Invalid variables" }] },
        { status: 200 },
      );
    }
    const events = getAuthorEvents(variables.authorId);
    return HttpResponse.json({
      data: { authorEvents: events },
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
    if (!author) {
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
    if (!book) {
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
];
