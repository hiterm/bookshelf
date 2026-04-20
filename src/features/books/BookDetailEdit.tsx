import { Box, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import React from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useCreateAuthor } from "../../compoments/hooks/useCreateAuthor";
import { useUpdateBook } from "../../compoments/hooks/useUpdateBook";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { resolvePendingAuthors } from "./resolvePendingAuthors";
import { BookUpdateForm } from "./BookUpdateForm";
import { Book } from "./entity/Book";

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const navigate = useNavigate();

  const updateBookMutation = useUpdateBook();
  const createAuthorMutation = useCreateAuthor();

  const handleSubmit = async (values: BookFormValues) => {
    let resolvedAuthors: Awaited<ReturnType<typeof resolvePendingAuthors>>;
    try {
      resolvedAuthors = await resolvePendingAuthors(
        values.authors,
        async (name) => {
          const result = await createAuthorMutation.mutateAsync({ name });
          return result.createAuthor.id;
        },
      );
    } catch (error) {
      showNotification({
        message: `Failed to create author: ${String(error)}`,
        color: "red",
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
      authorIds: resolvedAuthors.map((a) => a.id),
    };

    try {
      await updateBookMutation.mutateAsync(bookData);
      await navigate({ to: `/books/$id`, params: { id: book.id } });
      showNotification({ message: "更新しました", color: "teal" });
    } catch (error) {
      showNotification({
        message: `Failed to update book: ${String(error)}`,
        color: "red",
      });
    }
  };

  const form = useForm<BookFormValues>({
    initialValues: book,
    validate: zod4Resolver(bookFormSchema),
    validateInputOnBlur: true,
  });

  return (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <Box
        component="form"
        onSubmit={form.onSubmit((values, _event) => void handleSubmit(values))}
        style={{ minWidth: 400 }}
      >
        <BookUpdateForm form={form} />
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
