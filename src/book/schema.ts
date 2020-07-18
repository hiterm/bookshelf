import * as yup from 'yup';

const bookFormSchema = yup
  .object({
    title: yup.string().required(),
    authors: yup.array().of(yup.string().required()).required().default([]),
  })
  .required();

const bookSchema = bookFormSchema.shape({
  id: yup.string().required(),
  isbn: yup.string().matches(/^(\d-?){12}\d$/, { excludeEmptyString: true }),
  read: yup.boolean().required().default(false),
  priority: yup.number().integer().min(0).max(100).required().default(50),
  format: yup.string().oneOf(['eBook', 'Printed']).nullable(),
  store: yup.string().oneOf(['Kindle']).nullable(),
  owned: yup.boolean().defined().default(false),
  createdAt: yup
    .date()
    .required()
    .default(() => Date.now()),
  updatedAt: yup
    .date()
    .required()
    .default(() => Date.now()),
});

export type Book = yup.InferType<typeof bookSchema>;

const firebaseDocToBook = (doc: firebase.firestore.DocumentData) => {
  return bookSchema.cast({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });
};

export { bookFormSchema, bookSchema, firebaseDocToBook };
