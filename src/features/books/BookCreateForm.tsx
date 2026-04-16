import { ActionIcon, Group, Stack, Text, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import React from "react";
import { IconSearch } from "@tabler/icons-react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { Author } from "./entity/Author";
import { BookFormFields, BookFormValues } from "./BookFormFields";
import { useIsbnLookup } from "./useIsbnLookup";

type BookCreateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookCreateForm: React.FC<BookCreateFormProps> = ({ form }) => {
  const { data } = useAuthors();
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

  const isbnGroup = (
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
  );

  return <BookFormFields form={form} extraFields={isbnGroup} />;
};
