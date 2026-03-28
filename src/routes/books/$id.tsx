import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookDetailShow } from "../../features/books/BookDetailShow";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { useBook } from "../../compoments/hooks/useBook";

export const Route = createFileRoute("/books/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookDetailPage />;
}

const BookDetailPage: React.FC = () => {
  const { id } = Route.useParams();

  const { data, isLoading, error } = useBook(id);

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

  const graphqlBook = data.book;

  if (graphqlBook == null) {
    return <div>Not found.</div>;
  }

  const book = graphQlBookToBook(graphqlBook);

  return <BookDetailShow book={book} />;
};
