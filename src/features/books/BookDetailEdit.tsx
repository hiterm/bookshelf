import { Box, Button, Group } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useUpdateBookMutation } from "../../generated/graphql";
import { BookFormValues, useBookForm } from "./BookForm";
import { Book } from "./entity/Book";

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const navigate = useNavigate();

  const [_createBookResult, updateBook] = useUpdateBookMutation();

  const handleSubmit = async (values: BookFormValues) => {
    const bookData = {
      id: book.id,
      title: values.title,
      isbn: values.isbn,
      read: values.read,
      owned: values.owned,
      priority: values.priority,
      format: values.format,
      store: values.store,
      authorIds: values.authors.map((author) => author.id),
    };
    await updateBook({ bookData });
    await navigate({ to: `/books/$id`, params: { id: book.id } });
    showNotification({ message: "更新しました", color: "teal" });
  };

  const { form, submitForm } = useBookForm({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onSubmit: handleSubmit,
    initialValues: book,
  });

  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <Box component="form" onSubmit={submitForm} style={{ minWidth: 400 }}>
        {form}
        <Group mt="md">
          <Button type="submit">Save</Button>
          <LinkButton
            color="gray"
            linkOptions={{ to: "/books/$id", params: { id: book.id } }}
          >
            Cancel
          </LinkButton>
        </Group>
      </Box>
    </Box>
  );
};
