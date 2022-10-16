import {
  Checkbox,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { OnSubmit } from '@mantine/form/lib/types';
import { Box } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuthorsQuery } from '../../generated/graphql';
import {
  Author,
  BOOK_FORMAT_VALUE,
  BOOK_STORE_VALUE,
  IBookForm,
  displayBookFormat,
  displayBookStore,
} from './schema';

const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).nonempty(),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(['E_BOOK', 'PRINTED', 'UNKNOWN']),
  store: z.enum(['KINDLE', 'UNKNOWN']),
  owned: z.boolean().default(false),
});

type BookFormProps = {
  onSubmit: Parameters<OnSubmit<IBookForm>>[0];
  initialValues: IBookForm;
};

type BookFormReturn = {
  form: ReactElement;
  submitForm: ReturnType<OnSubmit<IBookForm>>;
};

export const useBookForm = (props: BookFormProps): BookFormReturn => {
  const form = useForm({
    initialValues: props.initialValues,
    validate: zodResolver(bookFormSchema),
  });

  const [open, setOpen] = useState(false);
  const [queryResult, reexecuteQuery] = useAuthorsQuery({ pause: true });
  const loadingAuthorOptions = open && queryResult.data == null;

  useEffect(() => {
    if (!loadingAuthorOptions) {
      return;
    }

    (async () => {
      reexecuteQuery();
    })();
  }, [loadingAuthorOptions, reexecuteQuery]);

  const formElement = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <TextInput label="書名" {...form.getInputProps('title')} />
      <MultiSelect
        label="著者"
        data={
          queryResult.data?.authors.map((author) => ({
            value: author.id,
            label: author.name,
          })) ?? ['Loading']
        }
        initiallyOpened={open}
        onDropdownOpen={() => {
          setOpen(true);
        }}
        onDropdownClose={() => {
          setOpen(false);
        }}
        disabled={loadingAuthorOptions}
        {...form.getInputProps('authors')}
        value={form.values.authors.map((author) => author.id)}
        onChange={(authorIds) => {
          form.getInputProps('authors').onChange(
            authorIds.map((authorId) => ({
              id: authorId,
              name: queryResult.data!.authors.find(
                (author) => author.id === authorId
              )?.name,
            }))
          );
        }}
      />
      <Select
        label="形式"
        {...form.getInputProps('format')}
        data={BOOK_FORMAT_VALUE.map((format) => ({
          value: format,
          label: displayBookFormat(format),
        }))}
      />
      <Select
        label="ストア"
        {...form.getInputProps('store')}
        data={BOOK_STORE_VALUE.map((store) => ({
          value: store,
          label: displayBookStore(store),
        }))}
      />
      <NumberInput label="優先度" {...form.getInputProps('priority')} />
      <TextInput label="ISBN" {...form.getInputProps('isbn')} />
      <Checkbox label="既読" {...form.getInputProps('read')} />
      <Checkbox label="所有" {...form.getInputProps('owned')} />
    </Box>
  );

  return { form: formElement, submitForm: form.onSubmit(props.onSubmit) };
};
