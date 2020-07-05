import * as yup from 'yup';

const bookFormSchema = yup
  .object({
    title: yup.string().required(),
    authors: yup.array().of(yup.string().required()).required().default([]),
  })
  .required();

const bookSchema = bookFormSchema.shape({
  id: yup.string().required(),
  isbn: yup.string().required().default(''),
  read: yup.boolean().required().default(false),
  priority: yup.number().required().default(50),
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
