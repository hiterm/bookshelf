import { Loader, Paper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { BookAddButton } from "../../features/books/BookAddButton";
import { BookList } from "../../features/books/BookList";
import { Book, graphQlBookToBook } from "../../features/books/entity/Book";
import { graphql } from "../../generated/gql";


export const Route = createFileRoute("/books/")({
  loader: async ({ context }) => {
    const booksResponse = await context.graphql.requestWithAuth(BooksQueryDocument);
    return booksResponse.books;
  },
  component: RouteComponent,
  pendingComponent: Loader,
});

function RouteComponent() {
  return <BookIndexPage />;
}

const BooksQueryDocument = graphql(/* GraphQL */ `
  query books {
    books {
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

const BookIndexPage: React.FC = () => {
  const rawBooks = Route.useLoaderData();
  const books: Book[] = rawBooks.map(graphQlBookToBook);

  return (
    <React.Fragment>
      <BookAddButton />
      <Paper shadow="xs" mt="md" p="lg">
        <BookList list={books} />
      </Paper>
    </React.Fragment>
  );
};
