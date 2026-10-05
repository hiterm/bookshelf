import { Box, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React, { useState } from "react";
import { LinkButton } from "../../components/mantineTsr";
import { useUpdateBook } from "./api/useUpdateBook";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { bookAuthorInput } from "./bookAuthorInput";
import { useAuthorConflictRecovery } from "./useAuthorConflictRecovery";
import { BookUpdateForm } from "./BookUpdateForm";
import { Book } from "./entity/Book";

export const BookEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const navigate = useNavigate();

  const updateBookMutation = useUpdateBook();
  const recoverAuthors = useAuthorConflictRecovery();
  const { reportError } = useAppError();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BookFormValues): Promise<void> => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const bookData = {
        id: book.id,
        title: values.title,
        isbn: values.isbn,
        read: values.read,
        owned: values.owned,
        priority: values.priority,
        format: values.format,
        store: values.store,
        purchaseDate: values.purchaseDate === "" ? null : values.purchaseDate,
        ...bookAuthorInput(values.authors),
      };

      try {
        await updateBookMutation.mutateAsync(bookData);
        await navigate({ to: `/books/$id`, params: { id: book.id } });
        showNotification({ message: "更新しました", color: "teal" });
      } catch (error) {
        if (
          await recoverAuthors(
            error,
            values.authors,
            () => form.getValues().authors,
            (authors) => {
              form.setFieldValue("authors", authors);
            },
          )
        )
          return;
        reportError({
          title: "書籍の更新に失敗しました",
          operation: "UpdateBook",
          error,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = useForm<BookFormValues>({
    initialValues: { ...book, purchaseDate: book.purchaseDate ?? "" },
    validate: zod4Resolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <Box
        component="form"
        onSubmit={(event) => {
          form.onSubmit((values) => void handleSubmit(values))(event);
        }}
        style={{ minWidth: 400 }}
      >
        <BookUpdateForm form={form} />
        <Group mt="md">
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            Save
          </Button>
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
