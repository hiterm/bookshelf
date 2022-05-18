import * as yup from 'yup';
import { firebase } from '../../Firebase';
import {
  BookFormat as GraphQLBookFormat,
  BookStore as GraphQLBookStore,
  BooksQuery,
} from '../../generated/graphql';

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

type BookFormat = 'eBook' | 'Printed' | 'Unknown';
type BookStore = 'Kindle' | 'Unknown';

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

export const graphQLBookFormatToBookFormat = (
  bookFormat: GraphQLBookFormat
): BookFormat => {
  switch (bookFormat) {
    case 'E_BOOK':
      return 'eBook';
    case 'PRINTED':
      return 'Printed';
    case 'UNKNOWN':
      return 'Unknown';
  }
};

export const graphQLBookStoreToBookStore = (
  bookStore: GraphQLBookStore
): BookStore => {
  switch (bookStore) {
    case 'KINDLE':
      return 'Kindle';
    case 'UNKNOWN':
      return 'Unknown';
  }
};

export const graphQlBookToBook = (book: GraphQLBook): Book => {
  return {
    ...book,
    format: graphQLBookFormatToBookFormat(book.format),
    store: graphQLBookStoreToBookStore(book.store),
    createdAt: new Date(1000 * book.createdAt),
    updatedAt: new Date(1000 * book.updatedAt),
  };
};

export const bookFormatToGraphQLBookFormat = (
  bookFormat: BookFormat
): GraphQLBookFormat => {
  switch (bookFormat) {
    case 'eBook':
      return 'E_BOOK';
    case 'Printed':
      return 'PRINTED';
    case 'Unknown':
      return 'UNKNOWN';
  }
};

export const bookStoreToGraphQLBookStore = (
  bookStore: BookStore
): GraphQLBookStore => {
  switch (bookStore) {
    case 'Kindle':
      return 'KINDLE';
    case 'Unknown':
      return 'UNKNOWN';
  }
};

const firebaseDocToBook = (doc: firebase.firestore.DocumentData): OldBook => {
  const book = bookSchema.cast({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });

  // TODO: 無理やりキャストしている。直す
  return book as OldBook;
};

export { bookBaseSchema as bookFormSchema, bookSchema, firebaseDocToBook };
