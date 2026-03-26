import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createGraphQLClient } from "../../lib/graphqlClient";
import { isDemoMode } from "../../config";

export const useBook = (bookId: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      if (isDemoMode) {
        const sdk = createGraphQLClient();
        return sdk.book({ bookId });
      }
      const token = await getAccessTokenSilently();
      const sdk = createGraphQLClient(token);
      return sdk.book({ bookId });
    },
  });
};
