import { BookFormat, BookStore } from "../../generated/graphql";
import { Author } from "./entity/Author";

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
