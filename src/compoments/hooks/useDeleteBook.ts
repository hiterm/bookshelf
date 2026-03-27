import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";

export const useDeleteBook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.deleteBook({ bookId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
