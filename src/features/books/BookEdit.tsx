import { Box, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React, { useRef, useState } from "react";
import { LinkButton } from "../../components/mantineTsr";
import { useCreateAuthor } from "../authors/api/useCreateAuthor";
import { useUpdateBook } from "./api/useUpdateBook";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { resolvePendingAuthors } from "./resolvePendingAuthors";
import { BookUpdateForm } from "./BookUpdateForm";
import { Book } from "./entity/Book";

export const BookEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const navigate = useNavigate();

  const updateBookMutation = useUpdateBook();
  const createAuthorMutation = useCreateAuthor();
  const { reportError } = useAppError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (values: BookFormValues): Promise<void> => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      let resolvedAuthors: Awaited<ReturnType<typeof resolvePendingAuthors>>;
      try {
        resolvedAuthors = await resolvePendingAuthors(
          values.authors,
          async (name) => {
            const result = await createAuthorMutation.mutateAsync({ name });
            return result.createAuthor.author.id;
          },
        );
      } catch (error) {
        reportError({
          title: "著者の作成に失敗しました",
          operation: "CreateAuthor",
          error,
        });
        return;
      }

      form.setFieldValue("authors", resolvedAuthors);

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
        authorIds: resolvedAuthors.map((a) => a.id),
      };

      try {
        await updateBookMutation.mutateAsync(bookData);
        await navigate({ to: `/books/$id`, params: { id: book.id } });
        showNotification({ message: "更新しました", color: "teal" });
      } catch (error) {
        reportError({
          title: "書籍の更新に失敗しました",
          operation: "UpdateBook",
          error,
        });
      }
    } finally {
      submittingRef.current = false;
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
