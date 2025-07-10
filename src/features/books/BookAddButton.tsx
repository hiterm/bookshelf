import { Button, Modal } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { useCreateBookMutation } from "../../generated/graphql";
import { BookFormValues, useBookForm } from "./BookForm";

export const BookAddButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const [_createBookResult, createBook] = useCreateBookMutation();

  const navigate = useNavigate();

  const submitBook = async (value: BookFormValues) => {
    const { authors, ...rest } = value;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    const result = await createBook({ bookData });

    if (result.data == null) {
      showNotification({
        message: `Some thing is wrong. error: ${JSON.stringify(result.error)}`,
        color: "red",
      });
      return;
    }
    const data = result.data;

    setOpen(false);

    showNotification({
      message: (
        <>
          <div>{value.title}を追加しました</div>
          <Button
            onClick={async () => {
              await navigate({ to: `/books/${data.createBook.id}` });
            }}
          >
            Move
          </Button>
        </>
      ),
      color: "teal",
    });
  };

  const emptyBook: BookFormValues = {
    title: "",
    authors: [],
    isbn: "",
    read: false,
    owned: false,
    priority: 50,
    format: "UNKNOWN",
    store: "UNKNOWN",
  };

  const { form, submitForm } = useBookForm({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onSubmit: submitBook,
    initialValues: emptyBook,
  });

  return (
    <div>
      <Button onClick={handleDialogOpenClick}>追加</Button>

      <Modal title="追加" opened={open} onClose={handleDialogCloseClick}>
        <form onSubmit={submitForm}>
          {form}
          <Button type="submit" mt="md">
            追加
          </Button>
        </form>
      </Modal>
    </div>
  );
};
