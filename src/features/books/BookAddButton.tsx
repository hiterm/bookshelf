import { Button, Modal } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useCreateBook } from "../../compoments/hooks/useCreateBook";
import { BookFormValues, useBookForm } from "./BookForm";

export const BookAddButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const createBookMutation = useCreateBook();

  const submitBook = async (value: BookFormValues) => {
    if (createBookMutation.isPending) return;
    const { authors, ...rest } = value;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };

    try {
      const result = await createBookMutation.mutateAsync(bookData);

      setOpen(false);

      showNotification({
        message: (
          <>
            <div>{value.title}を追加しました</div>
            <LinkButton
              linkOptions={{
                to: "/books/$id",
                params: { id: result.createBook.id },
              }}
            >
              Move
            </LinkButton>
          </>
        ),
        color: "teal",
      });
    } catch (error) {
      showNotification({
        message: `Failed to create book: ${String(error)}`,
        color: "red",
      });
    }
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
          <Button
            type="submit"
            mt="md"
            disabled={createBookMutation.isPending}
            loading={createBookMutation.isPending}
          >
            追加
          </Button>
        </form>
      </Modal>
    </div>
  );
};
