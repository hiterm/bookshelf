import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "./queryKeys";

export const useAuthors = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: authorQueryKeys.all,
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.authors();
    },
  });
};
