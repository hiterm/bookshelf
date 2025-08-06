import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookDetailEdit } from "../../features/books/BookDetailEdit";
import { graphQlBookToBook } from "../../features/books/entity/Book";
import { graphql } from "../../generated/gql";
import { useBookQuery } from "../../generated/graphql";

export const Route = createFileRoute("/books/$id/edit")({
  loader: async ({ context, params }) => {
    const [bookResponse, authorsResponse] = await Promise.all([
      context.graphql.requestWithAuth(BookDocument, { bookId: params.id }),
      context.graphql.requestWithAuth(AuthorsQueryDocument),
    ]);
    return { book: bookResponse.book, authors: authorsResponse.authors };
  },
  component: RouteComponent,
  pendingComponent: Loader,
});

function RouteComponent() {
  return <BookDetailEditPage />;
}

const BookDetailEditPage: React.FC = () => {
  const { book, authors } = Route.useLoaderData();

  if (!book) return <div>Not found.</div>;

  const bookData = graphQlBookToBook(book);
  return <BookDetailEdit book={bookData} authors={authors} />;
};

const BookDocument = graphql(/* GraphQL */ `
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

const AuthorsQueryDocument = graphql(/* GraphQL */ `
  query authors {
    authors {
      id
      name
    }
  }
`);
