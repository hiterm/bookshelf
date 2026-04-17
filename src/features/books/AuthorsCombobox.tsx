import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";
import React, { useState } from "react";
import { Author } from "./entity/Author";

type AuthorsComboboxProps = {
  authors: Author[];
  value: Author[];
  onChange: (authors: Author[]) => void;
  error?: React.ReactNode;
};

export const AuthorsCombobox: React.FC<AuthorsComboboxProps> = ({
  authors,
  value,
  onChange,
  error,
}) => {
  const [authorSearch, setAuthorSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
    },
  });

  const normalizedSearch = authorSearch.trim().toLowerCase();
  const exactAuthorMatch =
    normalizedSearch.length > 0 &&
    (authors.some((a) => a.name.toLowerCase() === normalizedSearch) ||
      value.some(
        (a) =>
          a.id.startsWith("__pending__:") &&
          a.name.toLowerCase() === normalizedSearch,
      ));

  const handleAuthorSelect = (val: string) => {
    setAuthorSearch("");
    if (val === "$create") {
      const name = authorSearch.trim();
      onChange([...value, { id: `__pending__:${name}`, name }]);
    } else {
      const already = value.some((a) => a.id === val);
      if (already) {
        onChange(value.filter((a) => a.id !== val));
      } else {
        const author = authors.find((a) => a.id === val);
        if (author) {
          onChange([...value, author]);
        }
      }
    }
  };

  const handleAuthorRemove = (id: string) => {
    onChange(value.filter((a) => a.id !== id));
  };

  return (
    <Combobox store={combobox} onOptionSubmit={handleAuthorSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          label="著者"
          onClick={() => {
            combobox.openDropdown();
          }}
          error={error}
        >
          <Pill.Group>
            {value.map((author) => (
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
                    value.length > 0
                  ) {
                    e.preventDefault();
                    handleAuthorRemove(value[value.length - 1].id);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {authors
            .filter((a) => a.name.toLowerCase().includes(normalizedSearch))
            .map((author) => (
              <Combobox.Option
                value={author.id}
                key={author.id}
                active={value.some((a) => a.id === author.id)}
              >
                <Group gap="sm">
                  {value.some((a) => a.id === author.id) && (
                    <CheckIcon size={12} />
                  )}
                  <span>{author.name}</span>
                </Group>
              </Combobox.Option>
            ))}

          {!exactAuthorMatch && normalizedSearch.length > 0 && (
            <Combobox.Option value="$create">
              + Create {authorSearch.trim()}
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
