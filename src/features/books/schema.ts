import * as yup from 'yup';
import { firebase } from '../../Firebase';

const bookFormSchema = yup
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

const bookSchema = bookFormSchema.shape({
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

export interface BookBaseType {
  title: string;
  authors: string[];
  isbn?: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format?: 'eBook' | 'Printed';
  store?: 'Kindle';
}

export interface Book {
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

const firebaseDocToBook = (doc: firebase.firestore.DocumentData): Book => {
  const book = bookSchema.cast({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });

  // TODO: 無理やりキャストしている。直す
  return book as Book;
};

export { bookFormSchema, bookSchema, firebaseDocToBook };
