import { Center, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useAuthor } from "../../compoments/hooks/useAuthor";
import { AuthorDetailEdit } from "../../features/authors/AuthorDetailEdit";

export const Route = createFileRoute("/authors/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthorDetailEditPage />;
}

const AuthorDetailEditPage: React.FC = () => {
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

  if (data.author == null) {
    return <div>Not found.</div>;
  }

  return <AuthorDetailEdit author={data.author} />;
};
