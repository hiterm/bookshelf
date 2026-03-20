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

export class MockStore {
  private authors: Map<string, Author>;
  private books: Map<string, Book>;
  private nextAuthorId: number;
  private nextBookId: number;

  constructor() {
    this.authors = new Map();
    this.books = new Map();
    this.nextAuthorId = 1;
    this.nextBookId = 1;
    this.seedData();
  }

  private seedData(): void {
    const author1 = this.createAuthor("著者1");
    const author2 = this.createAuthor("著者2");

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

  createAuthor(name: string): Author {
    const id = `author-${this.nextAuthorId++}`;
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
    const id = `book-${this.nextBookId++}`;
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

  reset(): void {
    this.authors.clear();
    this.books.clear();
    this.nextAuthorId = 1;
    this.nextBookId = 1;
    this.seedData();
  }
}

export const mockStore = new MockStore();

export function resetMockStore(): void {
  mockStore.reset();
}
