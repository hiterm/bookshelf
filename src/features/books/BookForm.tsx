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
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import React, { ReactElement } from "react";
import { z } from "zod";
import { IconSearch } from "@tabler/icons-react";
import { BookFormat, BookStore } from "../../generated/graphql-request";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { Author } from "./entity/Author";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";
import { useIsbnLookup } from "./useIsbnLookup";

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
    event: React.SyntheticEvent<HTMLFormElement> | undefined,
  ) => void;
  initialValues: BookFormValues;
  enableIsbnLookup?: boolean;
};

type BookFormReturn = {
  form: ReactElement;
  submitForm: React.EventHandler<React.SyntheticEvent<HTMLFormElement>>;
};

const normalizeIsbn = (isbn: string): string => isbn.replace(/-/g, "");
const isValidIsbn13 = (isbn: string): boolean =>
  /^\d{13}$/.test(normalizeIsbn(isbn));

export const useBookForm = (props: BookFormProps): BookFormReturn => {
  const form = useForm({
    initialValues: props.initialValues,
    validate: zodResolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  const { data, isLoading, error } = useAuthors();
  const { state: isbnLookupState, lookup: lookupIsbn } = useIsbnLookup();

  const handleIsbnLookup = async () => {
    const result = await lookupIsbn(normalizeIsbn(form.values.isbn));
    if (result == null || data == null) return;
    form.setFieldValue("title", result.title);
    const matched = Array.from(
      new Map(
        result.authorNames
          .map((name) =>
            data.authors.find(
              (a) => a.name.toLowerCase() === name.toLowerCase(),
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

  const submitForm = form.onSubmit(props.onSubmit);

  if (error) {
    return { form: <div>{JSON.stringify(error)}</div>, submitForm };
  }

  if (isLoading || data == null) {
    return { form: <Loader />, submitForm };
  }

  const isbnField = props.enableIsbnLookup ? (
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
          disabled={!isValidIsbn13(form.values.isbn)}
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
  ) : (
    <TextInput label="ISBN" {...form.getInputProps("isbn")} />
  );

  const formElement = (
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
      {isbnField}
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
