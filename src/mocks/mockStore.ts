import type { ImportBookInput } from "../generated/graphql-request";

type Author = {
  id: string;
  name: string;
  yomi: string;
};

type Book = {
  id: string;
  title: string;
  authorIds: string[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: string;
  store: string;
  createdAt: number;
  updatedAt: number;
};

type AuthorEvent = {
  eventId: string;
  eventSetId: string;
  operation: string;
  authorId: string;
  name: string | null;
  yomi: string | null;
  authorCreatedAt: number | null;
  authorUpdatedAt: number | null;
  changedAt: number;
  extra: Record<string, unknown> | null;
};

type BookEvent = {
  eventId: string;
  eventSetId: string;
  operation: string;
  bookId: string;
  title: string;
  authorIds: string[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: string;
  store: string;
  bookCreatedAt: number;
  bookUpdatedAt: number;
  changedAt: number;
  extra: null;
};

class MockStore {
  private authors: Map<string, Author>;
  private books: Map<string, Book>;
  private authorEvents: AuthorEvent[];
  private bookEvents: BookEvent[];
  private nextAuthorId: number;
  private nextBookId: number;
  private nextMergeId: number;
  private nextImportId: number;
  private _userRegistered: boolean;

  constructor(options?: { userRegistered?: boolean }) {
    this.authors = new Map();
    this.books = new Map();
    this.authorEvents = [];
    this.bookEvents = [];
    this.nextAuthorId = 1;
    this.nextBookId = 1;
    this.nextMergeId = 1;
    this.nextImportId = 1;
    this._userRegistered = options?.userRegistered ?? true;
    this.seedData();
  }

  isUserRegistered(): boolean {
    return this._userRegistered;
  }

  registerUser(): void {
    this._userRegistered = true;
  }

  private seedData(): void {
    const author1 = this.createAuthor("著者1", "ちょしゃいち");
    const author2 = this.createAuthor("著者2", "ちょしゃに");

    this.createBook({
      title: "テスト書籍1",
      authorIds: [author1.id],
      isbn: "978-4-00-000001-0",
      read: false,
      owned: true,
      priority: 50,
      format: "PRINTED",
      store: "UNKNOWN",
    });

    this.createBook({
      title: "テスト書籍2",
      authorIds: [author2.id],
      isbn: "978-4-00-000002-7",
      read: true,
      owned: true,
      priority: 80,
      format: "E_BOOK",
      store: "KINDLE",
    });
  }

  createAuthor(name: string, yomi = ""): Author {
    const id = `author-${String(this.nextAuthorId)}`;
    this.nextAuthorId += 1;
    const author: Author = { id, name, yomi };
    this.authors.set(id, author);
    return author;
  }

  getAuthor(id: string): Author | null {
    return this.authors.get(id) ?? null;
  }

  getAllAuthors(): Author[] {
    return Array.from(this.authors.values());
  }

  updateAuthor(id: string, name: string, yomi = ""): Author | null {
    const author = this.authors.get(id);
    if (author == null) return null;
    const updated: Author = { id, name, yomi };
    this.authors.set(id, updated);
    return updated;
  }

  deleteAuthor(id: string): boolean {
    return this.authors.delete(id);
  }

  mergeAuthor(
    sourceAuthorId: string,
    destinationAuthorId: string,
  ): { author: Author; eventSetId: string } | null {
    if (sourceAuthorId === destinationAuthorId) return null;
    const source = this.authors.get(sourceAuthorId);
    const destination = this.authors.get(destinationAuthorId);
    if (source == null || destination == null) return null;
    const mergeId = this.nextMergeId;
    this.nextMergeId += 1;
    const eventSetId = `merge-event-set-${String(mergeId)}`;
    const changedAt = Math.floor(Date.now() / 1000);

    this.books.forEach((book, bookId) => {
      if (!book.authorIds.includes(sourceAuthorId)) return;
      const authorIds = book.authorIds.map((authorId) =>
        authorId === sourceAuthorId ? destinationAuthorId : authorId,
      );
      this.books.set(bookId, {
        ...book,
        authorIds: [...new Set(authorIds)],
        updatedAt: Math.floor(Date.now() / 1000),
      });
      const updatedBook = this.books.get(bookId);
      if (updatedBook != null) {
        this.bookEvents.push({
          eventId: `merge-book-event-${String(mergeId)}-${bookId}`,
          eventSetId,
          operation: "UPDATE",
          bookId,
          title: updatedBook.title,
          authorIds: [...updatedBook.authorIds],
          isbn: updatedBook.isbn,
          read: updatedBook.read,
          owned: updatedBook.owned,
          priority: updatedBook.priority,
          format: updatedBook.format,
          store: updatedBook.store,
          bookCreatedAt: updatedBook.createdAt,
          bookUpdatedAt: updatedBook.updatedAt,
          changedAt,
          extra: null,
        });
      }
    });
    this.authorEvents.push(
      {
        eventId: `merge-source-event-${String(mergeId)}`,
        eventSetId,
        operation: "DELETE",
        authorId: sourceAuthorId,
        name: source.name,
        yomi: source.yomi,
        authorCreatedAt: null,
        authorUpdatedAt: null,
        changedAt,
        extra: {
          type: "merge",
          version: 1,
          destination_author_id: destinationAuthorId,
        },
      },
      {
        eventId: `merge-destination-event-${String(mergeId)}`,
        eventSetId,
        operation: "MERGE_AS_DESTINATION",
        authorId: destinationAuthorId,
        name: null,
        yomi: null,
        authorCreatedAt: null,
        authorUpdatedAt: null,
        changedAt,
        extra: { version: 1, source_author_id: sourceAuthorId },
      },
    );
    this.authors.delete(sourceAuthorId);
    return { author: destination, eventSetId };
  }

  getAuthorEvents(authorId: string): AuthorEvent[] {
    return this.authorEvents.filter((event) => event.authorId === authorId);
  }

  getBookEvents(bookId: string): BookEvent[] {
    return this.bookEvents.filter((event) => event.bookId === bookId);
  }

  createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Book {
    const id = `book-${String(this.nextBookId)}`;
    this.nextBookId += 1;
    const now = Math.floor(Date.now() / 1000);
    const book: Book = {
      ...bookData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.books.set(id, book);
    return book;
  }

  previewBookImport(bookInputs: ImportBookInput[]) {
    const existingAuthorNames = new Set(
      this.getAllAuthors().map((author) => author.name),
    );
    return {
      books: bookInputs.map(({ authorNames, ...book }) => ({
        ...book,
        authors: [...new Set(authorNames)].map((name) => ({
          name,
          status: existingAuthorNames.has(name)
            ? ("EXISTING" as const)
            : ("NEW" as const),
        })),
      })),
    };
  }

  importBooks(bookInputs: ImportBookInput[]): {
    eventSetId: string;
    books: Book[];
  } {
    const eventSetId = `import-event-set-${String(this.nextImportId)}`;
    this.nextImportId += 1;
    const books = bookInputs.map(({ authorNames, ...bookData }) => {
      const authorIds = authorNames.map((name) => {
        const existing = this.getAllAuthors().find(
          (author) => author.name === name,
        );
        return existing?.id ?? this.createAuthor(name).id;
      });
      return this.createBook({
        ...bookData,
        authorIds: [...new Set(authorIds)],
      });
    });
    return { eventSetId, books };
  }

  getBook(id: string): Book | null {
    return this.books.get(id) ?? null;
  }

  getAllBooks(): Book[] {
    return Array.from(this.books.values());
  }

  updateBook(
    bookData: { id: string } & Partial<
      Omit<Book, "id" | "createdAt" | "updatedAt">
    >,
  ): Book | null {
    const book = this.books.get(bookData.id);
    if (book == null) return null;

    const now = Math.floor(Date.now() / 1000);
    const updatedBook: Book = {
      ...book,
      ...bookData,
      updatedAt: now,
    };
    this.books.set(bookData.id, updatedBook);
    return updatedBook;
  }

  deleteBook(id: string): boolean {
    return this.books.delete(id);
  }
}

export const mockStore = new MockStore();
