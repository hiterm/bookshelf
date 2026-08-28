import type { ImportBookInput } from "../generated/graphql-request";

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

class MockStore {
  private authors = new Map<string, Author>();
  private books = new Map<string, Book>();
  private nextAuthorId = 1;
  private nextBookId = 1;
  private nextOperationId = 1;
  private _userRegistered: boolean;

  constructor(options?: { userRegistered?: boolean }) {
    this._userRegistered = options?.userRegistered ?? true;
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

  isUserRegistered() {
    return this._userRegistered;
  }
  registerUser() {
    this._userRegistered = true;
  }
  createAuthor(name: string, yomi = ""): Author {
    const author = { id: `author-${String(this.nextAuthorId)}`, name, yomi };
    this.nextAuthorId += 1;
    this.authors.set(author.id, author);
    return author;
  }
  getAuthor(id: string) {
    return this.authors.get(id) ?? null;
  }
  getAllAuthors() {
    return [...this.authors.values()];
  }
  updateAuthor(id: string, name: string, yomi = "") {
    if (!this.authors.has(id)) return null;
    const author = { id, name, yomi };
    this.authors.set(id, author);
    return author;
  }
  deleteAuthor(id: string) {
    return this.authors.delete(id);
  }
  mergeAuthor(sourceAuthorId: string, destinationAuthorId: string) {
    if (sourceAuthorId === destinationAuthorId) return null;
    const source = this.authors.get(sourceAuthorId);
    const author = this.authors.get(destinationAuthorId);
    if (source == null || author == null) return null;
    for (const [id, book] of this.books) {
      if (book.authorIds.includes(sourceAuthorId)) {
        this.books.set(id, {
          ...book,
          authorIds: [
            ...new Set(
              book.authorIds.map((authorId) =>
                authorId === sourceAuthorId ? destinationAuthorId : authorId,
              ),
            ),
          ],
          updatedAt: Math.floor(Date.now() / 1000),
        });
      }
    }
    this.authors.delete(sourceAuthorId);
    return { author, operationId: this.newOperationId("merge-author") };
  }
  createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Book {
    const now = Math.floor(Date.now() / 1000);
    const book = {
      ...bookData,
      id: `book-${String(this.nextBookId)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.nextBookId += 1;
    this.books.set(book.id, book);
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
    const book = this.books.get(bookData.id);
    if (book == null) return null;
    const updated = {
      ...book,
      ...bookData,
      updatedAt: Math.floor(Date.now() / 1000),
    };
    this.books.set(bookData.id, updated);
    return updated;
  }
  deleteBook(id: string) {
    return this.books.delete(id);
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
    return { operationId: this.newOperationId("import-books"), books };
  }
  private newOperationId(prefix: string) {
    const operationId = `${prefix}-operation-${String(this.nextOperationId)}`;
    this.nextOperationId += 1;
    return operationId;
  }
}

export const mockStore = new MockStore();
