import * as yup from 'yup';
import { firebase } from '../../Firebase';
import { Book as GraphQLBook } from '../../generated/graphql';

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

export type Book = {
  id: string;
  title: string;
  authors: Author[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: 'E_BOOK' | 'PRINTED' | 'UNKNOWN';
  store: 'KINDLE' | 'UNKNOWN';
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
  format: 'E_BOOK' | 'PRINTED' | 'UNKNOWN';
  store: 'KINDLE' | 'UNKNOWN';
};

export const graphQlBookToBook = (book: GraphQLBook): Book => {
  return {
    ...book,
    createdAt: new Date(1000 * book.createdAt),
    updatedAt: new Date(1000 * book.updatedAt),
  };
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
