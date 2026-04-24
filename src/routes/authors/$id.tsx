import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useAuthor } from "../../compoments/hooks/useAuthor";
import { AuthorDetailShow } from "../../features/authors/AuthorDetailShow";

export const Route = createFileRoute("/authors/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthorDetailPage />;
}

const AuthorDetailPage: React.FC = () => {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useAuthor(id);

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

  const author = data.author;

  if (author == null) {
    return <div>Not found.</div>;
  }

  return <AuthorDetailShow author={author} />;
};
