import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  Popover,
  TextInput,
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
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

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

  const handlePendingAuthorEdit = (author: Author) => {
    setEditingAuthorId(author.id);
    setEditingName(author.name);
  };

  const commitPendingAuthorEdit = () => {
    if (editingAuthorId == null) return;
    const newName = editingName.trim();
    if (newName) {
      onChange(
        value.map((a) =>
          a.id === editingAuthorId
            ? { id: `__pending__:${newName}`, name: newName }
            : a,
        ),
      );
    }
    setEditingAuthorId(null);
    setEditingName("");
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
            {value.map((author) => {
              const isPending = author.id.startsWith("__pending__:");
              const pill = (
                <Pill
                  key={author.id}
                  withRemoveButton
                  removeButtonProps={{
                    "aria-label": `Remove author ${author.name}`,
                  }}
                  onRemove={() => {
                    handleAuthorRemove(author.id);
                  }}
                  onClick={
                    isPending
                      ? (e) => {
                          e.stopPropagation();
                          handlePendingAuthorEdit(author);
                        }
                      : undefined
                  }
                  role={isPending ? "button" : undefined}
                  tabIndex={isPending ? 0 : undefined}
                  onKeyDown={
                    isPending
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handlePendingAuthorEdit(author);
                          }
                        }
                      : undefined
                  }
                  style={
                    isPending
                      ? {
                          backgroundColor: "var(--mantine-color-blue-1)",
                          color: "var(--mantine-color-blue-8)",
                          cursor: "pointer",
                        }
                      : undefined
                  }
                >
                  {isPending ? `+ ${author.name}` : author.name}
                </Pill>
              );
              if (!isPending) return pill;
              return (
                <Popover
                  key={author.id}
                  opened={editingAuthorId === author.id}
                  onClose={() => {
                    setEditingAuthorId(null);
                    setEditingName("");
                  }}
                  withArrow
                >
                  <Popover.Target>{pill}</Popover.Target>
                  <Popover.Dropdown>
                    <TextInput
                      value={editingName}
                      onChange={(e) => {
                        setEditingName(e.currentTarget.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitPendingAuthorEdit();
                        }
                        if (e.key === "Escape") {
                          setEditingAuthorId(null);
                          setEditingName("");
                        }
                      }}
                      onBlur={commitPendingAuthorEdit}
                      size="xs"
                      autoFocus
                    />
                  </Popover.Dropdown>
                </Popover>
              );
            })}
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
