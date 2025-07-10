import { Center, Loader } from "@mantine/core";
import { createFileRoute, useParams } from "@tanstack/react-router";
import React from "react";
import { BookDetailEdit } from "../../features/books/BookDetailEdit";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { useBookQuery } from "../../generated/graphql";

export const Route = createFileRoute("/books/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookDetailEditPage />;
}

const BookDetailEditPage: React.FC = () => {
  const { id } = useParams({ from: "/books/$id_/edit" });
  const [result] = useBookQuery({ variables: { bookId: id } });
  const { data, fetching, error } = result;

  if (error) return <>{JSON.stringify(error)}</>;
  if (fetching || !data) {
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
