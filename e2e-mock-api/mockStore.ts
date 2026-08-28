import type { ImportBookInput } from "../src/generated/graphql-request";

type Author = { id: string; name: string; yomi: string };
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
type AuthorRevision = {
  authorId: string;
  revisionNumber: number;
  name: string;
  yomi: string;
  authorCreatedAt: string;
  authorUpdatedAt: string;
  createdAt: string;
};
type BookRevision = {
  bookId: string;
  revisionNumber: number;
  title: string;
  authorIds: string[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: string;
  store: string;
  bookCreatedAt: string;
  bookUpdatedAt: string;
  createdAt: string;
};
type Operation = {
  id: string;
  type: string;
  detail: Record<string, unknown> | null;
  createdAt: string;
  bookChanges: {
    bookId: string;
    beforeRevision: BookRevision | null;
    afterRevision: BookRevision | null;
  }[];
  authorChanges: {
    authorId: string;
    beforeRevision: AuthorRevision | null;
    afterRevision: AuthorRevision | null;
  }[];
};

export class MockStore {
  private authors = new Map<string, Author>();
  private books = new Map<string, Book>();
  private authorRevisions: AuthorRevision[] = [];
  private bookRevisions: BookRevision[] = [];
  private operations: Operation[] = [];
  private nextAuthorId = 1;
  private nextBookId = 1;
  private nextOperationId = 1;
  private _userRegistered: boolean;

  constructor(options?: { userRegistered?: boolean }) {
    this._userRegistered = options?.userRegistered ?? true;
    const author1 = this.createAuthor("著者1", "ちょしゃいち");
    const author2 = this.createAuthor("著者2", "ちょしゃに");
    for (const data of [
      {
        title: "テスト書籍1",
        authorIds: [author1.id],
        isbn: "978-4-00-000001-0",
        read: false,
        owned: true,
        priority: 50,
        format: "PRINTED",
        store: "UNKNOWN",
      },
      {
        title: "テスト書籍2",
        authorIds: [author2.id],
        isbn: "978-4-00-000002-7",
        read: true,
        owned: true,
        priority: 80,
        format: "E_BOOK",
        store: "KINDLE",
      },
      {
        title: "テスト書籍3",
        authorIds: [author1.id],
        isbn: "978-4-00-000003-4",
        read: false,
        owned: false,
        priority: 30,
        format: "UNKNOWN",
        store: "UNKNOWN",
      },
      {
        title: "テスト書籍4",
        authorIds: [author2.id],
        isbn: "978-4-00-000004-1",
        read: true,
        owned: false,
        priority: 10,
        format: "E_BOOK",
        store: "KINDLE",
      },
    ])
      this.createBook(data);
  }

  isUserRegistered() {
    return this._userRegistered;
  }
  registerUser() {
    this._userRegistered = true;
  }
  private timestamp() {
    return new Date().toISOString();
  }
  private operation(
    type: string,
    detail: Record<string, unknown> | null,
    bookChanges: Operation["bookChanges"],
    authorChanges: Operation["authorChanges"],
  ) {
    const operation: Operation = {
      id: `operation-${String(this.nextOperationId)}`,
      type,
      detail,
      createdAt: this.timestamp(),
      bookChanges,
      authorChanges,
    };
    this.nextOperationId += 1;
    this.operations.unshift(operation);
    return operation.id;
  }
  private authorSnapshot(author: Author): AuthorRevision {
    const createdAt = this.timestamp();
    const revision = {
      authorId: author.id,
      revisionNumber: this.getAuthorRevisions(author.id).length + 1,
      name: author.name,
      yomi: author.yomi,
      authorCreatedAt: createdAt,
      authorUpdatedAt: createdAt,
      createdAt,
    };
    this.authorRevisions.unshift(revision);
    return revision;
  }
  private bookSnapshot(book: Book): BookRevision {
    const createdAt = this.timestamp();
    const revision = {
      bookId: book.id,
      revisionNumber: this.getBookRevisions(book.id).length + 1,
      title: book.title,
      authorIds: [...book.authorIds],
      isbn: book.isbn,
      read: book.read,
      owned: book.owned,
      priority: book.priority,
      format: book.format,
      store: book.store,
      bookCreatedAt: new Date(book.createdAt * 1000).toISOString(),
      bookUpdatedAt: new Date(book.updatedAt * 1000).toISOString(),
      createdAt,
    };
    this.bookRevisions.unshift(revision);
    return revision;
  }

  createAuthor(name: string, yomi = "") {
    const author = { id: `author-${String(this.nextAuthorId)}`, name, yomi };
    this.nextAuthorId += 1;
    this.authors.set(author.id, author);
    const afterRevision = this.authorSnapshot(author);
    this.operation(
      "create_author",
      null,
      [],
      [{ authorId: author.id, beforeRevision: null, afterRevision }],
    );
    return author;
  }
  getAuthor(id: string) {
    return this.authors.get(id) ?? null;
  }
  getAllAuthors() {
    return [...this.authors.values()];
  }
  updateAuthor(id: string, name: string, yomi = "") {
    const current = this.authors.get(id);
    if (current == null) return null;
    const beforeRevision = this.getAuthorRevisions(id)[0] ?? null;
    const author = { id, name, yomi };
    this.authors.set(id, author);
    const afterRevision = this.authorSnapshot(author);
    this.operation(
      "update_author",
      null,
      [],
      [{ authorId: id, beforeRevision, afterRevision }],
    );
    return author;
  }
  deleteAuthor(id: string) {
    const author = this.authors.get(id);
    if (author == null) return false;
    const beforeRevision =
      this.getAuthorRevisions(id)[0] ?? this.authorSnapshot(author);
    this.authors.delete(id);
    this.operation(
      "delete_author",
      null,
      [],
      [{ authorId: id, beforeRevision, afterRevision: null }],
    );
    return true;
  }
  mergeAuthor(sourceAuthorId: string, destinationAuthorId: string) {
    const source = this.authors.get(sourceAuthorId);
    const author = this.authors.get(destinationAuthorId);
    if (
      source == null ||
      author == null ||
      sourceAuthorId === destinationAuthorId
    )
      return null;
    const bookChanges: Operation["bookChanges"] = [];
    for (const [id, book] of this.books) {
      if (!book.authorIds.includes(sourceAuthorId)) continue;
      const beforeRevision = this.getBookRevisions(id)[0] ?? null;
      const updated = {
        ...book,
        authorIds: [
          ...new Set(
            book.authorIds.map((value) =>
              value === sourceAuthorId ? destinationAuthorId : value,
            ),
          ),
        ],
        updatedAt: Math.floor(Date.now() / 1000),
      };
      this.books.set(id, updated);
      bookChanges.push({
        bookId: id,
        beforeRevision,
        afterRevision: this.bookSnapshot(updated),
      });
    }
    const beforeRevision = this.getAuthorRevisions(sourceAuthorId)[0] ?? null;
    this.authors.delete(sourceAuthorId);
    const operationId = this.operation(
      "merge_author",
      { sourceAuthorId, destinationAuthorId },
      bookChanges,
      [{ authorId: sourceAuthorId, beforeRevision, afterRevision: null }],
    );
    return { author, operationId };
  }
  createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">) {
    const now = Math.floor(Date.now() / 1000);
    const book = {
      ...bookData,
      id: `book-${String(this.nextBookId)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.nextBookId += 1;
    this.books.set(book.id, book);
    const afterRevision = this.bookSnapshot(book);
    this.operation(
      "create_book",
      null,
      [{ bookId: book.id, beforeRevision: null, afterRevision }],
      [],
    );
    return book;
  }
  getBook(id: string) {
    return this.books.get(id) ?? null;
  }
  getAllBooks() {
    return [...this.books.values()];
  }
  updateBook(
    bookData: { id: string } & Partial<
      Omit<Book, "id" | "createdAt" | "updatedAt">
    >,
  ) {
    const current = this.books.get(bookData.id);
    if (current == null) return null;
    const beforeRevision = this.getBookRevisions(bookData.id)[0] ?? null;
    const book = {
      ...current,
      ...bookData,
      updatedAt: Math.floor(Date.now() / 1000),
    };
    this.books.set(book.id, book);
    const afterRevision = this.bookSnapshot(book);
    this.operation(
      "update_book",
      null,
      [{ bookId: book.id, beforeRevision, afterRevision }],
      [],
    );
    return book;
  }
  deleteBook(id: string) {
    const book = this.books.get(id);
    if (book == null) return false;
    const beforeRevision = this.getBookRevisions(id)[0] ?? null;
    this.books.delete(id);
    this.operation(
      "delete_book",
      null,
      [{ bookId: id, beforeRevision, afterRevision: null }],
      [],
    );
    return true;
  }
  getAuthorRevisions(authorId: string) {
    return this.authorRevisions.filter(
      (revision) => revision.authorId === authorId,
    );
  }
  getBookRevisions(bookId: string) {
    return this.bookRevisions.filter((revision) => revision.bookId === bookId);
  }
  getOperations() {
    return this.operations;
  }
  getOperation(id: string) {
    return this.operations.find((operation) => operation.id === id) ?? null;
  }
  previewBookImport(bookInputs: ImportBookInput[]) {
    const existing = new Set(this.getAllAuthors().map(({ name }) => name));
    return {
      books: bookInputs.map(({ authorNames, ...book }) => ({
        ...book,
        authors: [...new Set(authorNames)].map((name) => ({
          name,
          status: existing.has(name) ? ("EXISTING" as const) : ("NEW" as const),
        })),
      })),
    };
  }
  importBooks(bookInputs: ImportBookInput[]) {
    const start = this.operations.length;
    const books = bookInputs.map(({ authorNames, ...bookData }) => {
      const authorIds = authorNames.map(
        (name) =>
          this.getAllAuthors().find((author) => author.name === name)?.id ??
          this.createAuthor(name).id,
      );
      return this.createBook({
        ...bookData,
        authorIds: [...new Set(authorIds)],
      });
    });
    const nested = this.operations.splice(0, this.operations.length - start);
    const operationId = this.operation(
      "import_books",
      null,
      nested.flatMap((entry) => entry.bookChanges),
      nested.flatMap((entry) => entry.authorChanges),
    );
    return { operationId, books };
  }
}
