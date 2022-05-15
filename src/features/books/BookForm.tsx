import { zodResolver } from '@hookform/resolvers/zod';
import { RemoveCircle } from '@mui/icons-material';
import { Autocomplete, Box, Chip, IconButton, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Checkbox,
  Select,
  TextField as RhfTextField,
} from '../react-hook-form/mui';
import { BookBaseType } from './schema';

const bookFormSchema = z.object({
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

type BookFormType = {
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

const fromBookFormToBookBase = (bookForm: BookFormType): BookBaseType => {
  const { authors, ...rest } = bookForm;
  const authorNames: string[] = authors.map(({ name }) => name);
  return {
    authors: authorNames,
    ...rest,
  };
};

const fromBookBaseToBookForm = (bookBase: BookBaseType): BookFormType => {
  const { authors, ...rest } = bookBase;
  const authorObjects = authors.map((name) => ({
    name: name,
  }));
  return {
    authors: authorObjects,
    ...rest,
  };
};

const removeUndefinedFromBookForm = (bookForm: BookFormType): BookFormType => {
  if (bookForm.isbn === undefined) {
    delete bookForm.isbn;
  }
  if (bookForm.format === undefined) {
    delete bookForm.format;
  }
  if (bookForm.store === undefined) {
    delete bookForm.store;
  }

  return bookForm;
};

type BookFormProps = {
  onSubmit: SubmitHandler<BookBaseType>;
  initialValues: BookBaseType;
};

export const useBookForm = (props: BookFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: zodResolver(bookFormSchema),
    defaultValues: fromBookBaseToBookForm(props.initialValues),
  });
  const { fields, append, remove } = useFieldArray({
    name: 'authors',
    control,
  });

  const options = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
  ];

  const renderForm = () => (
    <form>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <RhfTextField
          label="書名"
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          control={{ control, name: 'title' }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RhfTextField
                    control={{ control, name: `authors.${index}.name` }}
                    label={`著者${index + 1}`}
                    error={Boolean(errors.authors?.[index]?.name)}
                    helperText={errors.authors?.[index]?.name?.message}
                    sx={{ flex: '1 0 auto' }}
                  />
                  <IconButton onClick={() => remove(index)}>
                    <RemoveCircle />
                  </IconButton>
                </Box>
              </div>
            );
          })}
          <Button
            variant="contained"
            type="button"
            onClick={() => append({})}
            sx={{ alignSelf: 'start' }}
          >
            著者追加
          </Button>
        </Box>
        <Autocomplete
          multiple
          freeSolo
          id="tags-outlined"
          options={options}
          getOptionLabel={(option) => option.title}
          defaultValue={[]}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              label="filterSelectedOptions"
              placeholder="Favorites"
            />
          )}
        />
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
        <RhfTextField
          type="number"
          label="優先度"
          error={Boolean(errors.priority)}
          helperText={errors.priority?.message}
          control={{
            control,
            name: 'priority',
            transform: {
              input: (value: number) => (isNaN(value) ? '' : value.toString()),
              output: (e) => parseInt(e.target.value, 10),
            },
          }}
        />
        <RhfTextField
          type="string"
          label="ISBN"
          error={Boolean(errors.isbn)}
          helperText={errors.isbn?.message}
          control={{ control, name: 'isbn' }}
        />
        <Checkbox name="read" label="既読" control={control} />
        <Checkbox name="owned" label="所有" control={control} />
      </Box>
    </form>
  );

  const convertAndHandleSubmit: SubmitHandler<BookFormType> = (
    bookFormValues
  ) => {
    const bookBase = fromBookFormToBookBase(
      removeUndefinedFromBookForm(bookFormValues)
    );
    props.onSubmit(bookBase);
  };

  return { renderForm, submitForm: handleSubmit(convertAndHandleSubmit) };
};
