import {
  Checkbox,
  Loader,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import React, { ReactElement, useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuthorsQuery } from '../../generated/graphql';
import {
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
  onSubmit: (
    values: IBookForm,
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  initialValues: IBookForm;
};

type BookFormReturn = {
  form: ReactElement;
  submitForm: React.FormEventHandler<HTMLFormElement>;
};

export const useBookForm = (props: BookFormProps): BookFormReturn => {
  const form = useForm({
    initialValues: props.initialValues,
    validate: zodResolver(bookFormSchema),
  });

  const [shouldLoad, setShouldLoad] = useState(false);
  const [queryResult, reexecuteQuery] = useAuthorsQuery({ pause: true });
  const loadingAuthorOptions = shouldLoad && queryResult.data == null;

  // TODO: 連続して開かれるとおかしなことになるかもしれない
  useEffect(() => {
    if (!loadingAuthorOptions) {
      return;
    }

    reexecuteQuery();
  }, [loadingAuthorOptions, reexecuteQuery]);

  const formElement = (
    <Stack>
      <TextInput label="書名" {...form.getInputProps('title')} />
      <MultiSelect
        label="著者"
        data={
          queryResult.data?.authors.map((author) => ({
            value: author.id,
            label: author.name,
          })) ?? []
        }
        onClick={() => setShouldLoad(true)}
        searchable
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
        // https://github.com/mantinedev/ui.mantine.dev/blob/master/components/AutocompleteLoading/AutocompleteLoading.tsx
        rightSection={loadingAuthorOptions ? <Loader size={16} /> : null}
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
      <Checkbox
        label="既読"
        {...form.getInputProps('read', { type: 'checkbox' })}
      />
      <Checkbox
        label="所有"
        {...form.getInputProps('owned', { type: 'checkbox' })}
      />
    </Stack>
  );

  return { form: formElement, submitForm: form.onSubmit(props.onSubmit) };
};
