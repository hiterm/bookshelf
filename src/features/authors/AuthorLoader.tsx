import { LocalError } from "../../components/errors/LocalError";
import { Center, Loader } from "@mantine/core";
import React from "react";
import { useAuthor } from "./api/useAuthor";
import type { AuthorQuery } from "../../generated/graphql-request";

type Author = NonNullable<AuthorQuery["author"]>;

type AuthorLoaderProps = {
  id: string;
  children: (author: Author) => React.ReactNode;
};

export const AuthorLoader: React.FC<AuthorLoaderProps> = ({ id, children }) => {
  const { data, isLoading, error } = useAuthor(id);

  if (error != null) {
    return <LocalError error={error} title="An unexpected error occurred." />;
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

  return <>{children(data.author)}</>;
};
