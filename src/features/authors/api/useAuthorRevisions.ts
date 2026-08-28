import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "./queryKeys";

export const useAuthorRevisions = (authorId: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: authorQueryKeys.revisions(authorId),
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.authorRevisions({ authorId });
    },
  });
};
