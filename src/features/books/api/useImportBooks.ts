import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportBookInput } from "../../../generated/graphql-request";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "./queryKeys";

export const useImportBooks = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (books: ImportBookInput[]) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.importBooks({ books });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
    },
  });
};
