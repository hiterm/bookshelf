import {
  ActionIcon,
  Checkbox,
  CheckIcon,
  Combobox,
  Group,
  Loader,
  NumberInput,
  Pill,
  PillsInput,
  Select,
  Stack,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import React, { useState } from "react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
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
  const [authorSearch, setAuthorSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
    },
  });

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

  const normalizedSearch = authorSearch.trim().toLowerCase();
  const exactAuthorMatch =
    normalizedSearch.length > 0 &&
    (data.authors.some((a) => a.name.toLowerCase() === normalizedSearch) ||
      form.values.authors.some(
        (a) =>
          a.id.startsWith("__pending__:") &&
          a.name.toLowerCase() === normalizedSearch,
      ));

  const handleAuthorSelect = (val: string) => {
    setAuthorSearch("");
    if (val === "$create") {
      const name = authorSearch.trim();
      form.setFieldValue("authors", [
        ...form.values.authors,
        { id: `__pending__:${name}`, name },
      ]);
    } else {
      const already = form.values.authors.some((a) => a.id === val);
      if (already) {
        form.setFieldValue(
          "authors",
          form.values.authors.filter((a) => a.id !== val),
        );
      } else {
        const author = data.authors.find((a) => a.id === val);
        if (author) {
          form.setFieldValue("authors", [...form.values.authors, author]);
        }
      }
    }
  };

  const handleAuthorRemove = (id: string) => {
    form.setFieldValue(
      "authors",
      form.values.authors.filter((a) => a.id !== id),
    );
  };

  return (
    <Stack>
      <TextInput label="書名" {...form.getInputProps("title")} />
      <Combobox store={combobox} onOptionSubmit={handleAuthorSelect}>
        <Combobox.DropdownTarget>
          <PillsInput
            label="著者"
            onClick={() => {
              combobox.openDropdown();
            }}
            error={
              typeof form.errors.authors === "string"
                ? form.errors.authors
                : undefined
            }
          >
            <Pill.Group>
              {form.values.authors.map((author) => (
                <Pill
                  key={author.id}
                  withRemoveButton
                  onRemove={() => {
                    handleAuthorRemove(author.id);
                  }}
                >
                  {author.name}
                </Pill>
              ))}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  onFocus={() => {
                    combobox.openDropdown();
                  }}
                  onBlur={() => {
                    combobox.closeDropdown();
                  }}
                  value={authorSearch}
                  placeholder="著者を検索"
                  onChange={(e) => {
                    combobox.updateSelectedOptionIndex();
                    setAuthorSearch(e.currentTarget.value);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      authorSearch.length === 0 &&
                      form.values.authors.length > 0
                    ) {
                      e.preventDefault();
                      handleAuthorRemove(
                        form.values.authors[form.values.authors.length - 1].id,
                      );
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          <Combobox.Options>
            {data.authors
              .filter((a) =>
                a.name
                  .toLowerCase()
                  .includes(authorSearch.trim().toLowerCase()),
              )
              .map((author) => (
                <Combobox.Option
                  value={author.id}
                  key={author.id}
                  active={form.values.authors.some((a) => a.id === author.id)}
                >
                  <Group gap="sm">
                    {form.values.authors.some((a) => a.id === author.id) && (
                      <CheckIcon size={12} />
                    )}
                    <span>{author.name}</span>
                  </Group>
                </Combobox.Option>
              ))}

            {!exactAuthorMatch && authorSearch.trim().length > 0 && (
              <Combobox.Option value="$create">
                + Create {authorSearch}
              </Combobox.Option>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
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
