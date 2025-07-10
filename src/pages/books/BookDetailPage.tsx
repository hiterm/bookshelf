import { Center, Loader } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import React from "react";
import { BookDetailShow } from "../../features/books/BookDetailShow";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { useBookQuery } from "../../generated/graphql";

const BookDetailPage: React.FC = () => {
  const { id } = useParams({ from: "/books/$id" });

  const [result, _reexecuteQuery] = useBookQuery({ variables: { bookId: id } });
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

  const graphqlBook = data.book;

  if (graphqlBook == null) {
    return <div>Not found.</div>;
  }

  const book = graphQlBookToBook(graphqlBook);

  // TanStack Router の Outlet には context プロパティはありません。子ルートで useRouteContext などを使って book を渡す設計に変更する必要があります。
  // ここでは一旦 book を props で渡す形に戻します。
  return <BookDetailShow book={book} />;
};

export { BookDetailPage };
