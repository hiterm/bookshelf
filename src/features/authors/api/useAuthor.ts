import type { AuthorQuery } from "../../../generated/graphql-request";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "./queryKeys";

export const useAuthor = (id: string): UseQueryResult<AuthorQuery> => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: authorQueryKeys.detail(id),
    enabled: id !== "",
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.author({ authorId: id });
    },
  });
};
