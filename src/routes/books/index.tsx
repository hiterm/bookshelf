import { Center, Loader, Paper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { BookAddButton } from "../../features/books/BookAddButton";
import { BookList } from "../../features/books/BookList";
import { Book, graphQlBookToBook } from "../../features/books/entity/Book";
import { useBooksQuery } from "../../generated/graphql";

export const Route = createFileRoute("/books/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookIndexPage />;
}

const BookIndexPage: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ["Book"] }), []);
  const [result, _reexecuteQuery] = useBooksQuery({ context });
  const { data, fetching, error } = result;

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
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
