import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "../../books/api/queryKeys";
import { authorQueryKeys } from "./queryKeys";

export const useDeleteAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorId: string) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.deleteAuthor({ authorId });
    },
    onSuccess: (_, authorId) => {
      void queryClient.invalidateQueries({ queryKey: authorQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: authorQueryKeys.detail(authorId),
      });
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.details });
    },
  });
};
