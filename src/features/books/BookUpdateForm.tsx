import {
  Checkbox,
  Loader,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import React from "react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { AuthorsCombobox } from "./AuthorsCombobox";
import { BookFormValues } from "./bookFormSchema";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

type BookUpdateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookUpdateForm: React.FC<BookUpdateFormProps> = ({ form }) => {
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
      <AuthorsCombobox
        authors={data.authors}
        value={form.values.authors}
        onChange={(v) => {
          form.setFieldValue("authors", v);
        }}
        error={
          typeof form.errors.authors === "string"
            ? form.errors.authors
            : undefined
        }
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
};
