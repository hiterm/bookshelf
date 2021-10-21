import { z } from 'zod';
import { firebase } from '../../Firebase';

const bookSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).nonempty(),
  isbn: z
    .string()
    .regex(/(^$|^(\d-?){12}\d$)/)
    .optional(),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(['eBook', 'Printed']).optional(),
  store: z.enum(['Kindle']).optional(),
  owned: z.boolean().default(false),
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
  // TODO: throwされたとき
  const book = bookSchema.parse({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });

  return book;
};

export { firebaseDocToBook };
