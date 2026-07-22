type AuthorEventEntry = {
  eventId: string;
  eventSetId: string;
  operation: string;
  authorId: string;
  name: string | null;
  yomi: string | null;
  authorCreatedAt: number | null;
  authorUpdatedAt: number | null;
  changedAt: number;
  extra: null;
};

type BookEventEntry = {
  eventId: string;
  eventSetId: string;
  operation: string;
  bookId: string;
  title: string | null;
  authorIds: string[];
  isbn: string | null;
  read: boolean | null;
  owned: boolean | null;
  priority: number | null;
  format: string | null;
  store: string | null;
  bookCreatedAt: number | null;
  bookUpdatedAt: number | null;
  changedAt: number;
  extra: null;
};

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

export class MockStore {
  private authors: Map<string, Author>;
  private books: Map<string, Book>;
  private authorEvents: AuthorEventEntry[];
  private bookEvents: BookEventEntry[];
  private nextAuthorId: number;
  private nextBookId: number;
  private nextEventId: number;
  private nextEventSetId: number;
  private _userRegistered: boolean;

  constructor(options?: { userRegistered?: boolean }) {
    this.authors = new Map();
    this.books = new Map();
    this.authorEvents = [];
    this.bookEvents = [];
    this.nextAuthorId = 1;
    this.nextBookId = 1;
    this.nextEventId = 1;
    this.nextEventSetId = 1;
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

    this.createBook({
      title: "テスト書籍3",
      authorIds: [author1.id],
      isbn: "978-4-00-000003-4",
      read: false,
      owned: false,
      priority: 30,
      format: "UNKNOWN",
      store: "UNKNOWN",
    });

    this.createBook({
      title: "テスト書籍4",
      authorIds: [author2.id],
      isbn: "978-4-00-000004-1",
      read: true,
      owned: false,
      priority: 10,
      format: "E_BOOK",
      store: "KINDLE",
    });
  }

  private recordAuthorEvent(
    operation: string,
    authorId: string,
    name: string | null,
    yomi: string | null,
    authorCreatedAt: number | null,
    authorUpdatedAt: number | null,
  ): void {
    const now = Math.floor(Date.now() / 1000);
    const eventSetId = `event-set-${String(this.nextEventSetId)}`;
    const eventId = `event-${String(this.nextEventId)}`;
    this.nextEventSetId += 1;
    this.nextEventId += 1;
    this.authorEvents.push({
      eventId,
      eventSetId,
      operation,
      authorId,
      name,
      yomi,
      authorCreatedAt,
      authorUpdatedAt,
      changedAt: now,
      extra: null,
    });
  }

  private recordBookEvent(
    operation: string,
    book: {
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
    },
  ): void {
    const now = Math.floor(Date.now() / 1000);
    const eventSetId = `event-set-${String(this.nextEventSetId)}`;
    const eventId = `event-${String(this.nextEventId)}`;
    this.nextEventSetId += 1;
    this.nextEventId += 1;
    this.bookEvents.push({
      eventId,
      eventSetId,
      operation,
      bookId: book.id,
      title: book.title,
      authorIds: [...book.authorIds],
      isbn: book.isbn,
      read: book.read,
      owned: book.owned,
      priority: book.priority,
      format: book.format,
      store: book.store,
      bookCreatedAt: book.createdAt,
      bookUpdatedAt: book.updatedAt,
      changedAt: now,
      extra: null,
    });
  }

  private createAuthorInternal(name: string, yomi = ""): Author {
    const id = `author-${String(this.nextAuthorId)}`;
    this.nextAuthorId += 1;
    const author: Author = { id, name, yomi };
    this.authors.set(id, author);
    return author;
  }

  private createBookInternal(
    bookData: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ): Book {
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

  createAuthor(name: string, yomi = ""): Author {
    const author = this.createAuthorInternal(name, yomi);
    this.recordAuthorEvent(
      "CREATE",
      author.id,
      author.name,
      author.yomi,
      null,
      null,
    );
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
    this.recordAuthorEvent("UPDATE", id, name, yomi, null, null);
    return updated;
  }

  deleteAuthor(id: string): boolean {
    const author = this.authors.get(id);
    if (author == null) return false;
    this.recordAuthorEvent("DELETE", id, author.name, author.yomi, null, null);
    const deleted = this.authors.delete(id);
    if (deleted) {
      this.books.forEach((book, bookId) => {
        if (book.authorIds.includes(id)) {
          this.books.set(bookId, {
            ...book,
            authorIds: book.authorIds.filter(
              (authorId: string) => authorId !== id,
            ),
          });
        }
      });
    }
    return deleted;
  }

  createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Book {
    const book = this.createBookInternal(bookData);
    this.recordBookEvent("CREATE", book);
    return book;
  }

  getBook(id: string): Book | null {
    return this.books.get(id) ?? null;
  }

  getAllBooks(): Book[] {
    return Array.from(this.books.values());
  }

  getAuthorEvents(authorId: string): AuthorEventEntry[] {
    return this.authorEvents
      .filter((e) => e.authorId === authorId)
      .sort((a, b) => b.changedAt - a.changedAt);
  }

  getBookEvents(bookId: string): BookEventEntry[] {
    return this.bookEvents
      .filter((e) => e.bookId === bookId)
      .sort((a, b) => b.changedAt - a.changedAt);
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
    this.recordBookEvent("UPDATE", updatedBook);
    return updatedBook;
  }

  deleteBook(id: string): boolean {
    const book = this.books.get(id);
    if (book == null) return false;
    this.recordBookEvent("DELETE", book);
    return this.books.delete(id);
  }
}
