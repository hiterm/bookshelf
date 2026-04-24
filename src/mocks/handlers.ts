import { graphql, HttpResponse } from "msw";
import { mockStore } from "./mockStore";

const graphqlApi = graphql.link("/api/graphql");

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
    const author = mockStore.getAuthor(variables.authorId as string);
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
    const book = mockStore.getBook(variables.bookId as string);
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
    const author = mockStore.createAuthor(
      (variables as { authorData: { name: string } }).authorData.name,
    );
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
    const { id, name } = (
      variables as { authorData: { id: string; name: string } }
    ).authorData;
    const author = mockStore.updateAuthor(id, name);
    if (!author) {
      return HttpResponse.json(
        { errors: [{ message: `Author not found: ${id}` }] },
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
    const authorId = (variables as { authorId: string }).authorId;
    const deleted = mockStore.deleteAuthor(authorId);
    if (!deleted) {
      return HttpResponse.json(
        { errors: [{ message: `Author not found: ${authorId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: { deleteAuthor: authorId },
    });
  }),

  graphqlApi.mutation("createBook", ({ variables }) => {
    const bookData = (
      variables as {
        bookData: Parameters<typeof mockStore.createBook>[0];
      }
    ).bookData;
    const book = mockStore.createBook(bookData);
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
    const bookData = (
      variables as {
        bookData: Parameters<typeof mockStore.updateBook>[0];
      }
    ).bookData;
    const book = mockStore.updateBook(bookData);
    if (!book) {
      return HttpResponse.json(
        { errors: [{ message: `Book not found: ${bookData.id}` }] },
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
    const bookId = (variables as { bookId: string }).bookId;
    const deleted = mockStore.deleteBook(bookId);
    if (!deleted) {
      return HttpResponse.json(
        { errors: [{ message: `Book not found: ${bookId}` }] },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      data: { deleteBook: bookId },
    });
  }),
];
