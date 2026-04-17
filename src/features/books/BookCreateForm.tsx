import {
  ActionIcon,
  Checkbox,
  Group,
  Loader,
  MultiSelect,
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
import { BookFormValues } from "./bookFormSchema";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";
import { Author } from "./entity/Author";
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
