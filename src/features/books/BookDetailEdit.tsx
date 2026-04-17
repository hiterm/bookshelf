import { Box, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "mantine-form-zod-resolver";
import React from "react";
import { LinkButton } from "../../compoments/mantineTsr";
import { useUpdateBook } from "../../compoments/hooks/useUpdateBook";
import { bookFormSchema, BookFormValues } from "./bookFormSchema";
import { BookUpdateForm } from "./BookUpdateForm";
import { Book } from "./entity/Book";

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const navigate = useNavigate();

  const updateBookMutation = useUpdateBook();

  const handleSubmit = async (values: BookFormValues) => {
    const bookData = {
      id: book.id,
      title: values.title,
      isbn: values.isbn,
      read: values.read,
      owned: values.owned,
      priority: values.priority,
      format: values.format,
      store: values.store,
      authorIds: values.authors.map((author) => author.id),
    };
    await updateBookMutation.mutateAsync(bookData);
    await navigate({ to: `/books/$id`, params: { id: book.id } });
    showNotification({ message: "更新しました", color: "teal" });
  };

  const form = useForm<BookFormValues>({
    initialValues: book,
    validate: zodResolver(bookFormSchema),
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
