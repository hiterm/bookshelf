import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  renderHook,
  waitFor,
  type RenderHookResult,
} from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { vi } from "vitest";
import type {
  BookQuery,
  BookRevisionsQuery,
  AuthorRevisionsQuery,
  Sdk,
  OperationsQuery,
} from "../../../generated/graphql-request";
import { useAuthor } from "../../authors/api/useAuthor";
import { useAuthors } from "../../authors/api/useAuthors";
import { useAuthorRevisions } from "../../authors/api/useAuthorRevisions";
import { useMergeAuthor } from "../../authors/api/useMergeAuthor";
import { useBook } from "./useBook";
import { useBooks } from "./useBooks";
import { useBookRevisions } from "./useBookRevisions";
import { useUpdateBook } from "./useUpdateBook";

import { useUpdateAuthor } from "../../authors/api/useUpdateAuthor";
import { useCreateAuthor } from "../../authors/api/useCreateAuthor";
import { useDeleteAuthor } from "../../authors/api/useDeleteAuthor";
import { useOperations } from "../../history/api/useOperations";
import { useOperation } from "../../history/api/useOperation";
import { useDeleteBook } from "./useDeleteBook";
import { useImportBooks } from "./useImportBooks";
import { useCreateBook } from "./useCreateBook";

const { sdk } = vi.hoisted(() => ({
  sdk: {
    author: vi.fn<Sdk["author"]>(),
    authors: vi.fn<Sdk["authors"]>(),
    authorRevisions: vi.fn<Sdk["authorRevisions"]>(),
    book: vi.fn<Sdk["book"]>(),
    books: vi.fn<Sdk["books"]>(),
    bookRevisions: vi.fn<Sdk["bookRevisions"]>(),
    mergeAuthor: vi.fn<Sdk["mergeAuthor"]>(),
    updateBook: vi.fn<Sdk["updateBook"]>(),
    updateAuthor: vi.fn<Sdk["updateAuthor"]>(),
    deleteBook: vi.fn<Sdk["deleteBook"]>(),
    importBooks: vi.fn<Sdk["importBooks"]>(),
    createBook: vi.fn<Sdk["createBook"]>(),
    createAuthor: vi.fn<Sdk["createAuthor"]>(),
    deleteAuthor: vi.fn<Sdk["deleteAuthor"]>(),
    operations: vi.fn<Sdk["operations"]>(),
    operation: vi.fn<Sdk["operation"]>(),
  },
}));
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn() }),
}));
vi.mock("../../../lib/graphqlClient", () => ({
  createAuthenticatedSdk: () => Promise.resolve(sdk),
}));

const source = { id: "source", name: "Source author", yomi: "" };
const destination = { id: "destination", name: "Destination author", yomi: "" };
const originalBook: NonNullable<BookQuery["book"]> = {
  id: "book",
  title: "Original title",
  isbn: "",
  read: false,
  owned: true,
  priority: 50,
  format: "UNKNOWN",
  store: "UNKNOWN",
  purchaseDate: null,
  createdAt: 1,
  updatedAt: 1,
  authors: [source],
};
const timestamp = "2026-09-28T00:00:00Z";
const bookRevision = (
  book: typeof originalBook,
  revisionNumber: number,
): BookRevisionsQuery["bookRevisions"][number] => ({
  bookId: book.id,
  revisionNumber,
  title: book.title,
  authorIds: book.authors.map((a) => a.id),
  isbn: book.isbn,
  read: book.read,
  owned: book.owned,
  priority: book.priority,
  format: book.format,
  store: book.store,
  purchaseDate: book.purchaseDate,
  bookCreatedAt: timestamp,
  bookUpdatedAt: timestamp,
  createdAt: timestamp,
});
const authorRevision = (
  author: typeof source,
  revisionNumber: number,
): AuthorRevisionsQuery["authorRevisions"][number] => ({
  authorId: author.id,
  revisionNumber,
  name: author.name,
  yomi: author.yomi,
  authorCreatedAt: timestamp,
  authorUpdatedAt: timestamp,
  createdAt: timestamp,
});

type CacheState = {
  authors: ReturnType<typeof useAuthors>;
  source: ReturnType<typeof useAuthor>;
  destination: ReturnType<typeof useAuthor>;
  importedAuthor: ReturnType<typeof useAuthor>;
  sourceHistory: ReturnType<typeof useAuthorRevisions>;
  destinationHistory: ReturnType<typeof useAuthorRevisions>;
  books: ReturnType<typeof useBooks>;
  book: ReturnType<typeof useBook>;
  history: ReturnType<typeof useBookRevisions>;
  operations: ReturnType<typeof useOperations>;
  operation: ReturnType<typeof useOperation>;
  rename: ReturnType<typeof useUpdateAuthor>;
  deleteBook: ReturnType<typeof useDeleteBook>;
  importBooks: ReturnType<typeof useImportBooks>;
  createBook: ReturnType<typeof useCreateBook>;
  createAuthor: ReturnType<typeof useCreateAuthor>;
  deleteAuthor: ReturnType<typeof useDeleteAuthor>;
  merge: ReturnType<typeof useMergeAuthor>;
  update: ReturnType<typeof useUpdateBook>;
};

function setup(): RenderHookResult<CacheState, unknown> & {
  client: QueryClient;
} {
  // Immutable server snapshots: cached objects must not change until hooks refetch.
  let book = structuredClone(originalBook);
  let authors = [source, destination];
  let revision = 1;
  let authorUpdated = false;
  let deleted = false;
  let extraBooks: (typeof originalBook)[] = [];
  let operations: OperationsQuery["operations"] = [
    { id: "initial", type: "create_book", detail: null, createdAt: timestamp },
  ];
  const record = (type: string): void => {
    operations = [
      { id: type, type, detail: null, createdAt: timestamp },
      ...operations,
    ];
  };
  sdk.operations.mockImplementation(() => Promise.resolve({ operations }));
  sdk.operation.mockResolvedValue({
    operation: { ...operations[0], bookChanges: [], authorChanges: [] },
  });
  sdk.book.mockImplementation(() =>
    Promise.resolve({ book: deleted ? null : book }),
  );
  sdk.books.mockImplementation(() =>
    Promise.resolve({ books: [...(deleted ? [] : [book]), ...extraBooks] }),
  );
  sdk.authors.mockImplementation(() => Promise.resolve({ authors }));
  sdk.author.mockImplementation(({ authorId }) => {
    const author = authors.find((a) => a.id === authorId);
    return Promise.resolve({
      author:
        author != null
          ? {
              ...author,
              books: [...(deleted ? [] : [book]), ...extraBooks].filter((b) =>
                b.authors.some((a) => a.id === authorId),
              ),
            }
          : null,
    });
  });
  sdk.bookRevisions.mockImplementation(() =>
    Promise.resolve({
      bookRevisions:
        revision === 1
          ? [bookRevision(originalBook, 1)]
          : [bookRevision(originalBook, 1), bookRevision(book, 2)],
    }),
  );
  sdk.authorRevisions.mockImplementation(({ authorId }) =>
    Promise.resolve({
      authorRevisions: [
        authorRevision(
          authors.find((a) => a.id === authorId) ?? source,
          authorUpdated && authorId === source.id ? 2 : revision,
        ),
      ],
    }),
  );
  sdk.mergeAuthor.mockImplementation(
    ({ sourceAuthorId, destinationAuthorId }) => {
      authors = authors.filter((author) => author.id !== sourceAuthorId);
      const target = authors.find(
        (author) => author.id === destinationAuthorId,
      );
      if (target == null) throw new Error("Unknown destination");
      book = { ...book, authors: [target] };
      revision = 2;
      record("merge_author");
      return Promise.resolve({
        mergeAuthor: { operationId: "merge", author: { id: destination.id } },
      });
    },
  );
  sdk.updateBook.mockImplementation(({ bookData }) => {
    book = {
      ...book,
      title: bookData.title,
      authors: authors.filter((author) =>
        bookData.authorIds.includes(author.id),
      ),
    };
    revision = 2;
    record("update_book");
    return Promise.resolve({ updateBook: { book: { id: book.id } } });
  });
  sdk.updateAuthor.mockImplementation(({ authorData }) => {
    const renamed = { ...source, ...authorData, yomi: authorData.yomi ?? "" };
    authors = authors.map((a) => (a.id === renamed.id ? renamed : a));
    book = {
      ...book,
      authors: book.authors.map((a) => (a.id === renamed.id ? renamed : a)),
    };
    authorUpdated = true;
    record("update_author");
    return Promise.resolve({ updateAuthor: { author: renamed } });
  });
  sdk.deleteBook.mockImplementation(({ bookId }) => {
    deleted = true;
    record("delete_book");
    return Promise.resolve({ deleteBook: { bookId: String(bookId) } });
  });
  sdk.importBooks.mockImplementation(() => {
    const imported = {
      id: "imported-author",
      name: "Imported author",
      yomi: "",
    };
    authors = [...authors, imported];
    extraBooks = [
      { ...originalBook, id: "imported-book", authors: [source, imported] },
    ];
    record("import_books");
    return Promise.resolve({
      importBooks: { operationId: "import_books", books: extraBooks },
    });
  });
  sdk.createBook.mockImplementation(() => {
    extraBooks = [
      { ...originalBook, id: "created-book", authors: [destination] },
    ];
    record("create_book");
    return Promise.resolve({ createBook: { book: { id: "created-book" } } });
  });
  sdk.createAuthor.mockImplementation(({ authorData }) => {
    const author = {
      id: "created-author",
      ...authorData,
      yomi: authorData.yomi ?? "",
    };
    authors = [...authors, author];
    record("create_author");
    return Promise.resolve({ createAuthor: { author: { id: author.id } } });
  });
  sdk.deleteAuthor.mockImplementation(({ authorId }) => {
    authors = authors.filter((a) => a.id !== authorId);
    book = { ...book, authors: book.authors.filter((a) => a.id !== authorId) };
    record("delete_author");
    return Promise.resolve({ deleteAuthor: { authorId: String(authorId) } });
  });
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren): React.JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () => ({
      authors: useAuthors(),
      source: useAuthor(source.id),
      destination: useAuthor(destination.id),
      importedAuthor: useAuthor("imported-author"),
      sourceHistory: useAuthorRevisions(source.id),
      destinationHistory: useAuthorRevisions(destination.id),
      books: useBooks(),
      book: useBook(originalBook.id),
      history: useBookRevisions(originalBook.id),
      operations: useOperations(),
      operation: useOperation("initial"),
      rename: useUpdateAuthor(),
      deleteBook: useDeleteBook(),
      importBooks: useImportBooks(),
      createBook: useCreateBook(),
      createAuthor: useCreateAuthor(),
      deleteAuthor: useDeleteAuthor(),
      merge: useMergeAuthor(),
      update: useUpdateBook(),
    }),
    { wrapper },
  );
  return { ...hook, client };
}

beforeEach(() => vi.resetAllMocks());

test("merge refreshes mounted lists, both authors, related books, and revisions", async () => {
  const { result, unmount, client } = setup();
  try {
    await waitFor(() => {
      for (const query of [
        result.current.authors,
        result.current.source,
        result.current.destination,
        result.current.sourceHistory,
        result.current.destinationHistory,
        result.current.books,
        result.current.book,
        result.current.history,
        result.current.operations,
        result.current.operation,
      ]) {
        expect(query.isSuccess).toBe(true);
      }
    });
    expect(result.current.source.data?.author?.books).toHaveLength(1);
    expect(result.current.destination.data?.author?.books).toEqual([]);
    expect(result.current.book.data?.book?.authors).toEqual([source]);
    expect(result.current.history.data?.bookRevisions).toHaveLength(1);
    await act(async () => {
      await result.current.merge.mutateAsync({
        sourceAuthorId: source.id,
        destinationAuthorId: destination.id,
      });
    });
    await waitFor(() => {
      expect(result.current.operations.data?.operations[0].type).toBe(
        "merge_author",
      );
      expect(result.current.authors.data?.authors).toEqual([destination]);
      expect(result.current.source.data?.author).toBeNull();
      expect(result.current.destination.data?.author?.books).toEqual([
        expect.objectContaining({ id: "book" }),
      ]);
      expect(result.current.books.data?.books[0].authors).toEqual([
        destination,
      ]);
      expect(result.current.book.data?.book?.authors).toEqual([destination]);
      expect(
        result.current.sourceHistory.data?.authorRevisions[0].revisionNumber,
      ).toBe(2);
      expect(
        result.current.destinationHistory.data?.authorRevisions[0]
          .revisionNumber,
      ).toBe(2);
      expect(result.current.history.data?.bookRevisions).toEqual([
        bookRevision(originalBook, 1),
        bookRevision({ ...originalBook, authors: [destination] }, 2),
      ]);
    });
  } finally {
    unmount();
    client.clear();
  }
});

test("failed update preserves data, then retry refreshes book, author associations, and history", async () => {
  const { result, unmount, client } = setup();
  const input = {
    ...originalBook,
    id: "book",
    title: "Updated title",
    authorIds: [destination.id],
  };
  try {
    await waitFor(() => {
      for (const query of [
        result.current.books,
        result.current.book,
        result.current.source,
        result.current.destination,
        result.current.history,
        result.current.operations,
        result.current.operation,
      ])
        expect(query.isSuccess).toBe(true);
    });
    sdk.updateBook.mockRejectedValueOnce(new Error("Update failed"));
    await act(async () => {
      await expect(result.current.update.mutateAsync(input)).rejects.toThrow(
        "Update failed",
      );
    });
    await waitFor(() => {
      expect(result.current.update.isError).toBe(true);
    });
    expect(result.current.book.data?.book).toEqual(originalBook);
    expect(result.current.books.data?.books[0].title).toBe("Original title");
    expect(result.current.source.data?.author?.books).toHaveLength(1);
    expect(result.current.destination.data?.author?.books).toEqual([]);
    expect(result.current.history.data?.bookRevisions).toHaveLength(1);
    expect(result.current.update.isSuccess).toBe(false);
    expectInitialHistory(result.current);
    await act(async () => {
      await result.current.update.mutateAsync(input);
    });
    await waitFor(() => {
      expect(result.current.update.isSuccess).toBe(true);
      expect(result.current.operations.data?.operations[0].type).toBe(
        "update_book",
      );
      expect(result.current.books.data?.books[0]).toMatchObject({
        title: "Updated title",
        authors: [destination],
      });
      expect(result.current.book.data?.book).toMatchObject({
        title: "Updated title",
        authors: [destination],
      });
      expect(result.current.source.data?.author?.books).toEqual([]);
      expect(result.current.destination.data?.author?.books).toEqual([
        expect.objectContaining({ title: "Updated title" }),
      ]);
      expect(result.current.history.data?.bookRevisions).toEqual([
        bookRevision(originalBook, 1),
        bookRevision(
          { ...originalBook, title: "Updated title", authors: [destination] },
          2,
        ),
      ]);
    });
  } finally {
    unmount();
    client.clear();
  }
});

// Keep every query subscribed for the whole mutation; no remount or focus events.
async function ready(
  result: RenderHookResult<CacheState, unknown>["result"],
): Promise<void> {
  await waitFor(() => {
    for (const query of [
      result.current.authors,
      result.current.source,
      result.current.destination,
      result.current.importedAuthor,
      result.current.books,
      result.current.book,
      result.current.history,
      result.current.sourceHistory,
      result.current.operations,
      result.current.operation,
    ]) {
      expect(query.isSuccess).toBe(true);
      expect(query.isFetching).toBe(false);
    }
  });
}

function expectInitialHistory(state: CacheState): void {
  expect(sdk.operations).toHaveBeenCalledTimes(1);
  expect(state.operations.data?.operations.map((o) => o.id)).toEqual([
    "initial",
  ]);
  expect(state.operation.data?.operation?.id).toBe("initial");
  expect(sdk.operation).toHaveBeenCalledTimes(1);
}

test("author rename retains caches on failure and refreshes embedded names, yomi, revisions and operations on retry", async () => {
  const { result, unmount, client } = setup();
  const input = { id: source.id, name: "Renamed author", yomi: "renamed" };
  try {
    await ready(result);
    sdk.updateAuthor.mockRejectedValueOnce(new Error("Rename failed"));
    await act(async () => {
      await expect(result.current.rename.mutateAsync(input)).rejects.toThrow(
        "Rename failed",
      );
    });
    await waitFor(() => {
      expect(result.current.rename.isError).toBe(true);
    });
    expect(result.current.rename.isSuccess).toBe(false);
    expect(result.current.authors.data?.authors).toEqual([source, destination]);
    expect(result.current.source.data?.author).toMatchObject(source);
    expect(result.current.book.data?.book?.authors).toEqual([source]);
    expect(result.current.books.data?.books[0].authors).toEqual([source]);
    expect(result.current.sourceHistory.data?.authorRevisions).toEqual([
      authorRevision(source, 1),
    ]);
    expectInitialHistory(result.current);
    expect(sdk.books).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.rename.mutateAsync(input);
    });
    await waitFor(() => {
      expect(result.current.rename.isSuccess).toBe(true);
      expect(result.current.authors.data?.authors[0]).toEqual(input);
      expect(result.current.source.data?.author).toMatchObject(input);
      expect(result.current.book.data?.book?.authors).toEqual([input]);
      expect(result.current.books.data?.books[0].authors).toEqual([input]);
      expect(result.current.sourceHistory.data?.authorRevisions).toEqual([
        authorRevision(input, 2),
      ]);
      expect(result.current.operations.data?.operations[0].type).toBe(
        "update_author",
      );
    });
    // Renaming live author data does not rewrite past book/operation snapshots.
    expect(result.current.history.data?.bookRevisions).toEqual([
      bookRevision(originalBook, 1),
    ]);
    expect(sdk.bookRevisions).toHaveBeenCalledTimes(1);
    expect(sdk.operation).toHaveBeenCalledTimes(1);
    expect(result.current.destination.data?.author).toMatchObject(destination);
  } finally {
    unmount();
    client.clear();
  }
});

test("book deletion refreshes mounted author books and operations without deleting revision snapshots", async () => {
  const { result, unmount, client } = setup();
  try {
    await ready(result);
    expect(result.current.source.data?.author?.books).toHaveLength(1);
    await act(async () => {
      await result.current.deleteBook.mutateAsync(originalBook.id);
    });
    await waitFor(() => {
      expect(result.current.books.data?.books).toEqual([]);
      expect(result.current.book.data?.book).toBeNull();
      expect(result.current.source.data?.author?.books).toEqual([]);
      expect(result.current.operations.data?.operations[0].type).toBe(
        "delete_book",
      );
    });
    expect(result.current.authors.data?.authors).toEqual([source, destination]);
    expect(sdk.authors).toHaveBeenCalledTimes(1);
    expect(result.current.history.data?.bookRevisions).toEqual([
      bookRevision(originalBook, 1),
    ]);
    expect(sdk.operation).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    client.clear();
  }
});

test("failed import retains directory, associations and operations; retry refreshes new authors and existing author books", async () => {
  const { result, unmount, client } = setup();
  const input = [
    {
      title: "Imported book",
      authorNames: [source.name, "Imported author"],
      isbn: "",
      read: false,
      owned: true,
      priority: 50,
      format: "UNKNOWN" as const,
      store: "UNKNOWN" as const,
      purchaseDate: null,
    },
  ];
  try {
    await ready(result);
    sdk.importBooks.mockRejectedValueOnce(new Error("Import failed"));
    await act(async () => {
      await expect(
        result.current.importBooks.mutateAsync(input),
      ).rejects.toThrow("Import failed");
    });
    await waitFor(() => {
      expect(result.current.importBooks.isError).toBe(true);
    });
    expect(result.current.importBooks.isSuccess).toBe(false);
    expect(result.current.importedAuthor.data?.author).toBeNull();
    expect(result.current.authors.data?.authors).toEqual([source, destination]);
    expect(result.current.books.data?.books).toEqual([originalBook]);
    expect(result.current.source.data?.author?.books).toHaveLength(1);
    expectInitialHistory(result.current);
    expect(sdk.authors).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.importBooks.mutateAsync(input);
    });
    await waitFor(() => {
      expect(result.current.importBooks.isSuccess).toBe(true);
      expect(result.current.books.data?.books).toHaveLength(2);
      expect(result.current.authors.data?.authors).toContainEqual({
        id: "imported-author",
        name: "Imported author",
        yomi: "",
      });
      expect(
        result.current.source.data?.author?.books.map((b) => b.id),
      ).toEqual(["book", "imported-book"]);
      expect(result.current.importedAuthor.data?.author).toMatchObject({
        name: "Imported author",
        books: [expect.objectContaining({ id: "imported-book" })],
      });
      expect(result.current.operations.data?.operations[0].type).toBe(
        "import_books",
      );
    });
    expect(result.current.book.data?.book).toEqual(originalBook);
    expect(sdk.book).toHaveBeenCalledTimes(1);
    expect(sdk.operation).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    client.clear();
  }
});

test("remaining directory/book writes append operations while preserving past operation detail", async () => {
  const { result, unmount, client } = setup();
  try {
    await ready(result);
    await act(async () => {
      await result.current.createAuthor.mutateAsync({
        name: "Created author",
        yomi: "",
      });
    });
    await waitFor(() => {
      expect(result.current.authors.data?.authors).toHaveLength(3);
      expect(
        result.current.operations.data?.operations.map((o) => o.type),
      ).toEqual(["create_author", "create_book"]);
    });
    await act(async () => {
      await result.current.createBook.mutateAsync({
        ...originalBook,
        authorIds: [destination.id],
      });
    });
    await waitFor(() => {
      expect(result.current.destination.data?.author?.books).toHaveLength(1);
      expect(result.current.operations.data?.operations).toHaveLength(3);
      expect(result.current.operations.data?.operations[0].type).toBe(
        "create_book",
      );
    });
    await act(async () => {
      await result.current.deleteAuthor.mutateAsync("created-author");
    });
    await waitFor(() => {
      expect(result.current.authors.data?.authors).toEqual([
        source,
        destination,
      ]);
      expect(result.current.book.data?.book?.authors).toEqual([source]);
      expect(result.current.operations.data?.operations).toHaveLength(4);
      expect(result.current.operations.data?.operations[0].type).toBe(
        "delete_author",
      );
    });
    expect(result.current.operation.data?.operation?.id).toBe("initial");
    expect(sdk.operation).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    client.clear();
  }
});
