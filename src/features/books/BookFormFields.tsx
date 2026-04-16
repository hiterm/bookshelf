import {
  Checkbox,
  Loader,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import React from "react";
import { z } from "zod";
import { BookFormat, BookStore } from "../../generated/graphql-request";
import { useAuthors } from "../../compoments/hooks/useAuthors";
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

export const bookFormSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.object({ id: z.string(), name: z.string() })).nonempty(),
  isbn: z.string().regex(/(^$|^(\d-?){12}\d$)/),
  read: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  format: z.enum(["E_BOOK", "PRINTED", "UNKNOWN"]),
  store: z.enum(["KINDLE", "UNKNOWN"]),
  owned: z.boolean().default(false),
});

type BookFormFieldsProps = {
  form: UseFormReturnType<BookFormValues>;
  extraFields?: React.ReactNode;
};

export const BookFormFields: React.FC<BookFormFieldsProps> = ({
  form,
  extraFields,
}) => {
  const { data, isLoading, error } = useAuthors();

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (isLoading || data == null) {
    return <Loader />;
  }

  return (
    <Stack>
      <TextInput label="書名" {...form.getInputProps("title")} />
      <MultiSelect
        label="著者"
        data={data.authors.map((author) => ({
          value: author.id,
          label: author.name,
        }))}
        searchable
        {...form.getInputProps("authors")}
        value={form.values.authors.map((author) => author.id)}
        onChange={(authorIds) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          form.getInputProps("authors").onChange(
            authorIds.map((authorId) => ({
              id: authorId,
              name: data.authors.find((author) => author.id === authorId)?.name,
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
      {extraFields ?? (
        <TextInput label="ISBN" {...form.getInputProps("isbn")} />
      )}
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
};
