import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "./queryKeys";

export const useAuthorEvents = (authorId: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: authorQueryKeys.events(authorId),
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.authorEvents({ authorId });
    },
  });
};
