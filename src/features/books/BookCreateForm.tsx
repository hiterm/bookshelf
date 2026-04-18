import {
  ActionIcon,
  Checkbox,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import React from "react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { AuthorsCombobox } from "./AuthorsCombobox";
import { BookFormValues } from "./bookFormSchema";
import { Author } from "./entity/Author";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";
import { useIsbnLookup } from "./useIsbnLookup";

type BookCreateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookCreateForm: React.FC<BookCreateFormProps> = ({ form }) => {
  const { data, isLoading, error } = useAuthors();
  const { state: isbnLookupState, lookup: lookupIsbn } = useIsbnLookup();

  const handleIsbnLookup = async () => {
    const result = await lookupIsbn(form.values.isbn);
    if (result == null || data == null) return;
    form.setFieldValue("title", result.title);
    const matched = Array.from(
      new Map(
        result.authorNames
          .map((name) =>
            data.authors.find(
              (a) => a.name.trim().toLowerCase() === name.trim().toLowerCase(),
            ),
          )
          .filter((a): a is Author => a !== undefined)
          .map((a) => [a.id, a]),
      ).values(),
    );
    if (matched.length > 0) {
      form.setFieldValue("authors", matched);
    }
  };

  if (error) {
    console.error(error);
    return <div>著者の読み込みに失敗しました。</div>;
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
      <Stack gap={0}>
        <Group align="flex-end" gap="xs">
          <TextInput
            label="ISBN"
            style={{ flex: 1 }}
            {...form.getInputProps("isbn")}
          />
          <ActionIcon
            onClick={() => {
              void handleIsbnLookup();
            }}
            loading={isbnLookupState.status === "loading"}
            size="lg"
            variant="default"
            aria-label="自動入力"
          >
            <IconSearch size={16} />
          </ActionIcon>
        </Group>
        {isbnLookupState.status === "error" && (
          <Text size="xs" c="red" mt={4} role="alert">
            {isbnLookupState.message}
          </Text>
        )}
      </Stack>
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
