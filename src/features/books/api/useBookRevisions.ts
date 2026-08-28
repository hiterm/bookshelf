import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "./queryKeys";

export const useBookRevisions = (bookId: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: bookQueryKeys.revisions(bookId),
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.bookRevisions({ bookId });
    },
  });
};
