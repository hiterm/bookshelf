import { BookFormat, BooksQuery, BookStore } from "../../generated/graphql";

export type Author = {
  id: string;
  name: string;
};

type GraphQLBook = BooksQuery["books"][0];

export type Book = {
  id: string;
  title: string;
  authors: Author[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: BookFormat;
  store: BookStore;
  createdAt: Date;
  updatedAt: Date;
};

export type IBookForm = {
  title: string;
  authors: Author[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: BookFormat;
  store: BookStore;
};

export const graphQlBookToBook = (book: GraphQLBook): Book => {
  return {
    ...book,
    createdAt: new Date(1000 * book.createdAt),
    updatedAt: new Date(1000 * book.updatedAt),
  };
};
