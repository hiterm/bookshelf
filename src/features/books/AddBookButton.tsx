import { Button, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React, { useState } from "react";
import { LinkButton } from "../../components/mantineTsr";
import { useCreateBook } from "./api/useCreateBook";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { BookCreateForm } from "./BookCreateForm";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { bookAuthorInput } from "./bookAuthorInput";
import { useAuthorConflictRecovery } from "./useAuthorConflictRecovery";

export const AddBookButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDialogOpenClick = (): void => {
    setOpen(true);
  };

  const handleDialogCloseClick = (): void => {
    setOpen(false);
  };

  const createBookMutation = useCreateBook();
  const recoverAuthors = useAuthorConflictRecovery();
  const { reportError } = useAppError();

  const submitBook = async (value: BookFormValues): Promise<void> => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { authors: _authors, purchaseDate, ...rest } = value;
      const bookData = {
        ...rest,
        purchaseDate: purchaseDate === "" ? null : purchaseDate,
        ...bookAuthorInput(value.authors),
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
                  params: { id: result.createBook.book.id },
                }}
              >
                Move
              </LinkButton>
            </>
          ),
          color: "teal",
        });
      } catch (error) {
        if (
          await recoverAuthors(
            error,
            value.authors,
            () => form.getValues().authors,
            (authors) => {
              form.setFieldValue("authors", authors);
            },
          )
        )
          return;
        reportError({
          title: "書籍の作成に失敗しました",
          operation: "CreateBook",
          error,
        });
      }
    } finally {
      setIsSubmitting(false);
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
    purchaseDate: "",
  };

  const form = useForm({
    initialValues: emptyBook,
    validate: zod4Resolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  return (
    <div>
      <Button onClick={handleDialogOpenClick}>追加</Button>

      <Modal title="書籍追加" opened={open} onClose={handleDialogCloseClick}>
        <form
          onSubmit={(event) => {
            form.onSubmit((values) => void submitBook(values))(event);
          }}
        >
          <BookCreateForm form={form} />
          <Button
            type="submit"
            mt="md"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            追加
          </Button>
        </form>
      </Modal>
    </div>
  );
};
