import * as yup from 'yup';

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
    .default(() => Date.now()),
  updatedAt: yup
    .date()
    .required()
    .default(() => Date.now()),
});

export interface DbBook {
  title: string;
  authors: string[];
  isbn?: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format?: '' | 'eBook' | 'Printed';
  store?: '' | 'Kindle';
}
export interface Book extends DbBook {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const firebaseDocToBook = (doc: firebase.firestore.DocumentData): Book => {
  let book = bookSchema.cast({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });

  return book;
};

export { bookFormSchema, bookSchema, firebaseDocToBook };
