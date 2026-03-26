import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createGraphQLClient } from "../../lib/graphqlClient";
import { isDemoMode } from "../../config";

export const useLoggedInUser = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ["loggedInUser"],
    queryFn: async () => {
      if (isDemoMode) {
        const sdk = createGraphQLClient();
        return sdk.loggedInUser();
      }
      const token = await getAccessTokenSilently();
      const sdk = createGraphQLClient(token);
      return sdk.loggedInUser();
    },
  });
};
