import { Center, Group, Loader, Paper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { AddBookButton } from "../../features/books/AddBookButton";
import { BookList } from "../../features/books/BookList";
import { ImportBooksButton } from "../../features/books/import/ImportBooksButton";
import { bookSearchSchema } from "../../features/books/bookSearch";
import { Book, graphQlBookToBook } from "../../features/books/entity/Book";
import { useBooks } from "../../features/books/api/useBooks";

export const Route = createFileRoute("/books/")({
  validateSearch: bookSearchSchema,
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
      <Group>
        <AddBookButton />
        <ImportBooksButton />
      </Group>
      <Paper shadow="xs" mt="md" p="lg">
        <BookList list={books} />
      </Paper>
    </React.Fragment>
  );
};
