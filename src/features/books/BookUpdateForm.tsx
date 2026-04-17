import {
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
  TextInput,
  useCombobox,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import React, { useState } from "react";
import { useAuthors } from "../../compoments/hooks/useAuthors";
import { BookFormValues } from "./bookFormSchema";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "./entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "./entity/BookStore";

type BookUpdateFormProps = {
  form: UseFormReturnType<BookFormValues>;
};

export const BookUpdateForm: React.FC<BookUpdateFormProps> = ({ form }) => {
  const { data, isLoading, error } = useAuthors();
  const [authorSearch, setAuthorSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
    },
  });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
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
