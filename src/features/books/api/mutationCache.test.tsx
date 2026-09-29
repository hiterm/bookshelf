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
} from "../../../generated/graphql-request";
import { useAuthor } from "../../authors/api/useAuthor";
import { useAuthors } from "../../authors/api/useAuthors";
import { useAuthorRevisions } from "../../authors/api/useAuthorRevisions";
import { useMergeAuthor } from "../../authors/api/useMergeAuthor";
import { useBook } from "./useBook";
import { useBooks } from "./useBooks";
import { useBookRevisions } from "./useBookRevisions";
import { useUpdateBook } from "./useUpdateBook";

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
  sourceHistory: ReturnType<typeof useAuthorRevisions>;
  destinationHistory: ReturnType<typeof useAuthorRevisions>;
  books: ReturnType<typeof useBooks>;
  book: ReturnType<typeof useBook>;
  history: ReturnType<typeof useBookRevisions>;
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
  sdk.book.mockImplementation(() => Promise.resolve({ book }));
  sdk.books.mockImplementation(() => Promise.resolve({ books: [book] }));
  sdk.authors.mockImplementation(() => Promise.resolve({ authors }));
  sdk.author.mockImplementation(({ authorId }) =>
    Promise.resolve({
      author: authors.some((a) => a.id === authorId)
        ? {
            ...(authorId === source.id ? source : destination),
            books: book.authors.some((a) => a.id === authorId) ? [book] : [],
          }
        : null,
    }),
  );
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
        authorRevision(authorId === source.id ? source : destination, revision),
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
    return Promise.resolve({ updateBook: { book: { id: book.id } } });
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
      sourceHistory: useAuthorRevisions(source.id),
      destinationHistory: useAuthorRevisions(destination.id),
      books: useBooks(),
      book: useBook(book.id),
      history: useBookRevisions(book.id),
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
    await act(async () => {
      await result.current.update.mutateAsync(input);
    });
    await waitFor(() => {
      expect(result.current.update.isSuccess).toBe(true);
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
