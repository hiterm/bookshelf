import { Checkbox, Loader, MultiSelect, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import React, { ReactElement } from "react";
import { z } from "zod";
import { BookFormat, BookStore, useAuthorsQuery } from "../../generated/graphql";
import { Author } from "./entity/Author";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

export type BookFormValues = {
  title: string;
  authors: Author[];
  isbn: string;
  read: boolean;
  owned: boolean;
  priority: number;
  format: BookFormat;
  store: BookStore;
};

const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).nonempty(),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(["E_BOOK", "PRINTED", "UNKNOWN"]),
  store: z.enum(["KINDLE", "UNKNOWN"]),
  owned: z.boolean().default(false),
});

type BookFormProps = {
  onSubmit: (
    values: BookFormValues,
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
  initialValues: BookFormValues;
};

type BookFormReturn = {
  form: ReactElement;
  submitForm: React.FormEventHandler<HTMLFormElement>;
};

export const useBookForm = (props: BookFormProps): BookFormReturn => {
  const form = useForm({
    initialValues: props.initialValues,
    validate: zodResolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  const [queryResult, _reexecuteQuery] = useAuthorsQuery();

  const data = queryResult.data;

  const submitForm = form.onSubmit(props.onSubmit);

  if (queryResult.fetching || data == null) {
    return { form: <Loader />, submitForm };
  }

  if (queryResult.error) {
    return { form: <div>{JSON.stringify(queryResult.error)}</div>, submitForm };
  }

  const formElement = (
    <Stack>
      <TextInput label="書名" {...form.getInputProps("title")} />
      <MultiSelect
        label="著者"
        data={data?.authors.map((author) => ({
          value: author.id,
          label: author.name,
        })) ?? []}
        searchable
        {...form.getInputProps("authors")}
        value={form.values.authors.map((author) => author.id)}
        onChange={(authorIds) => {
          form.getInputProps("authors").onChange(
            authorIds.map((authorId) => ({
              id: authorId,
              name: data.authors.find(
                (author) => author.id === authorId,
              )?.name,
            })),
          );
        }}
      />
      <Select
        label="形式"
        {...form.getInputProps("format")}
        data={BOOK_FORMAT_VALUE.map((format) => ({
          value: format,
          label: displayBookFormat(format),
        }))}
      />
      <Select
        label="ストア"
        {...form.getInputProps("store")}
        data={BOOK_STORE_VALUE.map((store) => ({
          value: store,
          label: displayBookStore(store),
        }))}
      />
      <NumberInput label="優先度" {...form.getInputProps("priority")} />
      <TextInput label="ISBN" {...form.getInputProps("isbn")} />
      <Checkbox
        label="既読"
        {...form.getInputProps("read", { type: "checkbox" })}
      />
      <Checkbox
        label="所有"
        {...form.getInputProps("owned", { type: "checkbox" })}
      />
    </Stack>
  );

  return { form: formElement, submitForm };
};
