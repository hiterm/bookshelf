import { Box, Button, Group } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useUpdateBookMutation } from "../../generated/graphql";
import { BookFormValues, useBookForm } from "./BookForm";
import { Author } from "./entity/Author";
import { Book } from "./entity/Book";

export const BookDetailEdit: React.FC<{ book: Book; authors: Author[] }> = ({
  book,
  authors,
}) => {
  const navigate = useNavigate();

  const [_createBookResult, updateBook] = useUpdateBookMutation();

  const handleSubmit = async (values: BookFormValues) => {
    const { authors, ...rest } = values;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    await updateBook({ bookData: { id: book.id, ...bookData } });
    await navigate({ to: `/books/$id`, params: { id: book.id } });
    showNotification({ message: "更新しました", color: "teal" });
  };

  const { form, submitForm } = useBookForm({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onSubmit: handleSubmit,
    initialValues: book,
    authors,
  });

  // TODO: Authorが上手く動かない
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
