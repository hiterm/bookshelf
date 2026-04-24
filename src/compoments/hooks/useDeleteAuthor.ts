import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";

export const useDeleteAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorId: string) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.deleteAuthor({ authorId });
    },
    onSuccess: (_, authorId) => {
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
      void queryClient.invalidateQueries({ queryKey: ["author", authorId] });
      void queryClient.invalidateQueries({ queryKey: ["books"] });
      void queryClient.invalidateQueries({ queryKey: ["book"] });
    },
  });
};
