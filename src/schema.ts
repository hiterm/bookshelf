import * as yup from 'yup';

const bookFormSchema = yup
  .object({
    title: yup.string().required(),
    authors: yup.array().of(yup.string().required()).required().default([]),
  })
  .defined();

const bookSchema = bookFormSchema.shape({
  id: yup.string().required(),
  isbn: yup.string().defined().nullable(),
  read: yup.boolean().defined().nullable(),
  priority: yup.number().defined().nullable(),
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

export { bookFormSchema, bookSchema };
