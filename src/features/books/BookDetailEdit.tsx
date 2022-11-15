import { Box, Button, Group } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import { useHistory } from "react-router-dom";
import { useUpdateBookMutation } from "../../generated/graphql";
import { useBookForm } from "./BookForm";
import { Book } from "./entity/Book";
import { IBookForm } from "./types";

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const history = useHistory();

  const [_createBookResult, updateBook] = useUpdateBookMutation();

  const handleSubmit = async (values: IBookForm) => {
    const { authors, ...rest } = values;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    await updateBook({ bookData: { id: book.id, ...bookData } });
    history.push(`/books/${book.id}`);
    showNotification({ message: "更新しました", color: "teal" });
  };

  const { form, submitForm } = useBookForm({
    onSubmit: handleSubmit,
    initialValues: book,
  });

  // TODO: Authorが上手く動かない
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box component="form" onSubmit={submitForm} sx={{ minWidth: 400 }}>
        {form}
        <Group mt="md">
          <Button type="submit">
            Save
          </Button>
          <Button
            color="gray"
            onClick={() => {
              history.goBack();
            }}
          >
            Cancel
          </Button>
        </Group>
      </Box>
    </Box>
  );
};
