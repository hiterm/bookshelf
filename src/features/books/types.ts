import { BookFormat, BookStore } from "../../generated/graphql";

export type Author = {
  id: string;
  name: string;
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
