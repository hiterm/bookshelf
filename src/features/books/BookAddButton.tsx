import { Button, Modal } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useCreateBookMutation } from "../../generated/graphql";
import { useBookForm } from "./BookForm";
import { IBookForm } from "./schema";

export const BookAddButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const [_createBookResult, createBook] = useCreateBookMutation();

  const history = useHistory();

  const submitBook = async (value: IBookForm) => {
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
            onClick={() => {
              history.push(`/books/${data.createBook.id}`);
            }}
          >
            Move
          </Button>
        </>
      ),
      color: "teal",
    });
  };

  const emptyBook: IBookForm = {
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
