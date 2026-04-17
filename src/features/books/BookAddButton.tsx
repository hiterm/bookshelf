import { Button, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import React, { useState } from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useCreateAuthor } from "../../compoments/hooks/useCreateAuthor";
import { useCreateBook } from "../../compoments/hooks/useCreateBook";
import { BookCreateForm } from "./BookCreateForm";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { resolvePendingAuthors } from "./resolvePendingAuthors";

export const BookAddButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const createBookMutation = useCreateBook();
  const createAuthorMutation = useCreateAuthor();

  const submitBook = async (value: BookFormValues) => {
    if (createBookMutation.isPending) return;
    const resolvedAuthors = await resolvePendingAuthors(
      value.authors,
      async (name) => {
        const result = await createAuthorMutation.mutateAsync({ name });
        return result.createAuthor.id;
      },
    );
    const { authors: _authors, ...rest } = value;
    const bookData = {
      ...rest,
      authorIds: resolvedAuthors.map((a) => a.id),
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

  const form = useForm({
    initialValues: emptyBook,
    validate: zodResolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  return (
    <div>
      <Button onClick={handleDialogOpenClick}>追加</Button>

      <Modal title="追加" opened={open} onClose={handleDialogCloseClick}>
        <form
          onSubmit={form.onSubmit((values, _event) => void submitBook(values))}
        >
          <BookCreateForm form={form} />
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
