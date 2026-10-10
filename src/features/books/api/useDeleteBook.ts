import type { DeleteBookMutation } from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateBookDelete } from "./invalidation";

export const useDeleteBook = (): UseMutationResult<
  DeleteBookMutation,
  Error,
  string
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.deleteBook({ bookId });
    },
    onSuccess: (_, bookId) => {
      invalidateBookDelete(queryClient, bookId);
    },
  });
};
