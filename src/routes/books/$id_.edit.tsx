import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookDetailEdit } from "../../features/books/BookDetailEdit";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { useBook } from "../../compoments/hooks/useBook";

export const Route = createFileRoute("/books/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookDetailEditPage />;
}

const BookDetailEditPage: React.FC = () => {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useBook(id);

  if (error) return <>{JSON.stringify(error)}</>;
  if (isLoading || !data) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  if (!data.book) return <div>Not found.</div>;

  const book = graphQlBookToBook(data.book);
  return <BookDetailEdit book={book} />;
};
