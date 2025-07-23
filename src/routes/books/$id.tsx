// Book detail page with graphql-request loader (urql removed)

import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookDetailShow } from "../../features/books/BookDetailShow";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { graphql } from "../../generated/gql";

export const BookQueryDocument = graphql(/* GraphQL */ `
  query book($bookId: ID!) {
    book(id: $bookId) {
      id
      title
      authors {
        id
        name
      }
      isbn
      read
      owned
      priority
      format
      store
      createdAt
      updatedAt
    }
  }
`);

export const Route = createFileRoute("/books/$id")({
  loader: async ({ params, context }) => {
    const data = await context.graphql.requestWithAuth(
      BookQueryDocument,
      { bookId: params.id }
    );
    return data.book;
  },
  component: RouteComponent,
  pendingComponent: Loader,
});

function RouteComponent() {
  return <BookDetailPage />;
}

const BookDetailPage: React.FC = () => {
  const graphqlBook = Route.useLoaderData();
  if (!graphqlBook) {
    return <div>Not found.</div>;
  }
  const book = graphQlBookToBook(graphqlBook);
  return <BookDetailShow book={book} />;
};
