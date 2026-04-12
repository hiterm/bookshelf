import { Center, Loader, Paper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import { BookAddButton } from "../../features/books/BookAddButton";
import { BookList } from "../../features/books/BookList";
import { Book, graphQlBookToBook } from "../../features/books/entity/Book";
import { useBooks } from "../../compoments/hooks/useBooks";

const columnFilterSchema = z.object({
  id: z.string(),
  value: z.unknown(),
});

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const Route = createFileRoute("/books/")({
  validateSearch: z.object({
    columnFilters: z.array(columnFilterSchema).optional(),
    sorting: z.array(sortingItemSchema).optional(),
    pageIndex: z.number().nonnegative().optional(),
    pageSize: z.number().nonnegative().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <BookIndexPage />;
}

const BookIndexPage: React.FC = () => {
  const { data, isLoading, error } = useBooks();

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (isLoading || data == null) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  const books: Book[] = data.books.map(graphQlBookToBook);

  return (
    <React.Fragment>
      <BookAddButton />
      <Paper shadow="xs" mt="md" p="lg">
        <BookList list={books} />
      </Paper>
    </React.Fragment>
  );
};
