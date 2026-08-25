import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookEdit } from "../../features/books/BookEdit";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { useBook } from "../../features/books/api/useBook";

export const Route = createFileRoute("/books/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookEditPage />;
}

const BookEditPage: React.FC = () => {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useBook(id);

  if (error != null) return <>{JSON.stringify(error)}</>;
  if (isLoading || data == null) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  if (data.book == null) return <div>Not found.</div>;

  const book = graphQlBookToBook(data.book);
  return <BookEdit book={book} />;
};
