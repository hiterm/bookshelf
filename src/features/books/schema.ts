import * as yup from 'yup';
import { BookFormat, BookStore, BooksQuery } from '../../generated/graphql';

const bookBaseSchema = yup
  .object({
    title: yup.string().required(),
    authors: yup.array().of(yup.string().required()).required().default([]),
    isbn: yup.string().matches(/^(\d-?){12}\d$/, { excludeEmptyString: true }),
    read: yup.boolean().required().default(false),
    priority: yup.number().integer().min(0).max(100).required().default(50),
    format: yup.string().oneOf(['eBook', 'Printed']),
    store: yup.string().oneOf(['Kindle']),
    owned: yup.boolean().defined().default(false),
  })
  .required();

const bookSchema = bookBaseSchema.shape({
  id: yup.string().required(),
  createdAt: yup
    .date()
    .required()
    .default(() => new Date()),
  updatedAt: yup
    .date()
    .required()
    .default(() => new Date()),
});

export interface OldBookBaseType {
  title: string;
  authors: string[];
  isbn?: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format?: 'eBook' | 'Printed';
  store?: 'Kindle';
}

export interface OldBook {
  title: string;
  authors: string[];
  isbn?: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format?: 'eBook' | 'Printed';
  store?: 'Kindle';
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Author = {
  id: string;
  name: string;
};

type GraphQLBook = BooksQuery['books'][0];

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

export const BOOK_FORMAT_VALUE: BookFormat[] = ['UNKNOWN', 'E_BOOK', 'PRINTED'];
export const BOOK_STORE_VALUE: BookStore[] = ['UNKNOWN', 'KINDLE'];

export const displayBookFormat = (format: BookFormat): string => {
  switch (format) {
    case 'E_BOOK':
      return 'eBook';
    case 'PRINTED':
      return 'Printed';
    case 'UNKNOWN':
      return 'Unknown';
  }
};

export const displayBookStore = (store: BookStore): string => {
  switch (store) {
    case 'KINDLE':
      return 'Kindle';
    case 'UNKNOWN':
      return 'Unknown';
  }
};

export { bookBaseSchema as bookFormSchema, bookSchema };
