import { Center, Loader, Text } from "@mantine/core";
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
    console.error(error);
    return <Text>An unexpected error occurred.</Text>;
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
