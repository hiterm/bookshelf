import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "./queryKeys";

export const useDeleteBook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.deleteBook({ bookId });
    },
    onSuccess: (_, bookId) => {
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: bookQueryKeys.detail(bookId),
      });
    },
  });
};
