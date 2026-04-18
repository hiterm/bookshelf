import {
  Button,
  Checkbox,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { UseFormReturnType } from "@mantine/form";
import React, { useState } from "react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { AuthorsCombobox } from "./AuthorsCombobox";
import { BookSearchDialog } from "./BookSearchDialog";
import { BookFormValues } from "./bookFormSchema";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

type BookCreateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookCreateForm: React.FC<BookCreateFormProps> = ({ form }) => {
  const { data, isLoading, error } = useAuthors();
  const [searchOpened, setSearchOpened] = useState(false);

  if (error) {
    console.error(error);
    return <div>著者の読み込みに失敗しました。</div>;
  }

  if (isLoading || data == null) {
    return <Loader />;
  }

  return (
    <Stack>
      <Group>
        <Button
          variant="light"
          leftSection={<IconSearch size={16} />}
          onClick={() => {
            setSearchOpened(true);
          }}
        >
          検索して自動入力
        </Button>
      </Group>
      <BookSearchDialog
        opened={searchOpened}
        onClose={() => {
          setSearchOpened(false);
        }}
        onSelect={(result) => {
          form.setFieldValue("title", result.title);
          form.setFieldValue("isbn", result.isbn);
          const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();
          const resolvedAuthors = result.authorNames.map((name) => {
            const existing = data.authors.find(
              (a) =>
                a.name.trim().toLowerCase() === name.trim().toLowerCase() ||
                normalize(a.name) === normalize(name),
            );
            return existing ?? { id: `__pending__:${name}`, name };
          });
          const uniqueAuthors = Array.from(
            new Map(resolvedAuthors.map((a) => [a.id, a])).values(),
          );
          form.setFieldValue("authors", uniqueAuthors);
          setSearchOpened(false);
        }}
      />
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
