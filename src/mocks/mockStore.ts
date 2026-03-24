type Author = {
  id: string;
  name: string;
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

class MockStore {
  private authors: Map<string, Author>;
  private books: Map<string, Book>;
  private nextAuthorId: number;
  private nextBookId: number;
  private _userRegistered: boolean;

  constructor(options?: { userRegistered?: boolean }) {
    this.authors = new Map();
    this.books = new Map();
    this.nextAuthorId = 1;
    this.nextBookId = 1;
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
    const author1 = this.createAuthor("\u8457\u80051");
    const author2 = this.createAuthor("\u8457\u80052");

    this.createBook({
      title: "\u30c6\u30b9\u30c8\u66f8\u7c4d1",
      authorIds: [author1.id],
      isbn: "978-4-00-000001-0",
      read: false,
      owned: true,
      priority: 50,
      format: "PRINTED",
      store: "UNKNOWN",
    });

    this.createBook({
      title: "\u30c6\u30b9\u30c8\u66f8\u7c4d2",
      authorIds: [author2.id],
      isbn: "978-4-00-000002-7",
      read: true,
      owned: true,
      priority: 80,
      format: "E_BOOK",
      store: "KINDLE",
    });
  }

  createAuthor(name: string): Author {
    const id = `author-${String(this.nextAuthorId)}`;
    this.nextAuthorId += 1;
    const author: Author = { id, name };
    this.authors.set(id, author);
    return author;
  }

  getAuthor(id: string): Author | null {
    return this.authors.get(id) ?? null;
  }

  getAllAuthors(): Author[] {
    return Array.from(this.authors.values());
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
    if (!book) return null;

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
