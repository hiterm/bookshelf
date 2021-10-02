import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox, Select, TextField } from '../react-hook-form/mui';
import { BookBaseType } from './schema';

const zBookFormSchema = z.object({
  title: z.string().min(1),
  authors: z
    .array(z.object({ name: z.string().min(1) }))
    .nonempty()
    .default([{ name: '' }]),
  isbn: z
    .string()
    .regex(/(^$|^(\d-?){12}\d$)/)
    .optional(),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(['eBook', 'Printed']).optional(),
  store: z.enum(['Kindle']).optional(),
  owned: z.boolean().default(false),
});

export type BookFormType = {
  isbn?: string | undefined;
  format?: 'eBook' | 'Printed' | undefined;
  store?: 'Kindle' | undefined;
  title: string;
  authors: {
    name: string;
  }[];
  read: boolean;
  priority: number;
  owned: boolean;
};

export const fromBookFormToBookBase = (
  bookForm: BookFormType
): BookBaseType => {
  const { authors, ...rest } = bookForm;
  const authorNames: string[] = authors.map(({ name }) => name);
  return {
    authors: authorNames,
    ...rest,
  };
};

export const fromBookBaseToBookForm = (
  bookBase: BookBaseType
): BookFormType => {
  const { authors, ...rest } = bookBase;
  const authorObjects = authors.map((name) => ({
    name: name,
  }));
  return {
    authors: authorObjects,
    ...rest,
  };
};

type BookFormProps = {
  onSubmit: SubmitHandler<BookFormType>;
  initialValues: BookFormType;
  id: string;
};

export const BookForm: React.FC<BookFormProps> = (props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: zodResolver(zBookFormSchema),
    defaultValues: props.initialValues,
  });
  const { fields, append, remove } = useFieldArray({
    name: 'authors',
    control,
  });

  return (
    <form id={props.id} onSubmit={handleSubmit(props.onSubmit)}>
      {JSON.stringify(errors)}
      <div>
        <TextField
          name="title"
          label="書名"
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          control={control}
        />
      </div>
      <div>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <InputLabel shrink={true}>著者{index + 1}</InputLabel>
              <div>
                <TextField
                  name={`authors.${index}.name`}
                  error={Boolean(errors.authors?.[index]?.name)}
                  helperText={errors.authors?.[index]?.name?.message}
                  control={control}
                />
                <Button
                  variant="contained"
                  type="button"
                  onClick={() => remove(index)}
                >
                  -
                </Button>
              </div>
            </div>
          );
        })}
        <Button variant="contained" type="button" onClick={() => append({})}>
          著者追加
        </Button>
      </div>
      <div>
        <Select
          name="format"
          label="形式"
          error={Boolean(errors.format)}
          helperText={errors.format?.message}
          control={control}
        >
          <MenuItem value={''}>-</MenuItem>
          <MenuItem value={'eBook'}>eBook</MenuItem>
          <MenuItem value={'Printed'}>Printed</MenuItem>
        </Select>
      </div>
      <div>
        <Select
          name="store"
          label="ストア"
          error={Boolean(errors.store)}
          helperText={errors.store?.message}
          control={control}
        >
          <MenuItem value={''}>-</MenuItem>
          <MenuItem value={'Kindle'}>Kindle</MenuItem>
        </Select>
      </div>
      <div>
        <TextField
          name="priority"
          type="number"
          label="優先度"
          error={Boolean(errors.priority)}
          helperText={errors.priority?.message}
          control={control}
        />
      </div>
      <div>
        <TextField
          name="isbn"
          type="string"
          label="ISBN"
          error={Boolean(errors.isbn)}
          helperText={errors.isbn?.message}
          control={control}
        />
      </div>
      <div>
        <Checkbox name="read" label="既読" control={control} />
      </div>
      <div>
        <Checkbox name="owned" label="所有" control={control} />
      </div>
    </form>
  );
};
