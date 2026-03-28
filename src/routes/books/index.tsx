import { Center, Loader, Paper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookAddButton } from "../../features/books/BookAddButton";
import { BookList } from "../../features/books/BookList";
import { Book, graphQlBookToBook } from "../../features/books/entity/Book";
import { useBooks } from "../../compoments/hooks/useBooks";

export const Route = createFileRoute("/books/")({
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
