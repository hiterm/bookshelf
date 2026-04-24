import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";

export const useAuthor = (id: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ["author", id],
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.author({ authorId: id });
    },
  });
};
