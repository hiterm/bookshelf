import type {
  UpdateBookMutation,
  UpdateBookInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateBookUpdate } from "./invalidation";

export const useUpdateBook = (): UseMutationResult<
  UpdateBookMutation,
  Error,
  UpdateBookInput
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: UpdateBookInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.updateBook({ bookData });
    },
    onSuccess: (_, variables) => {
      invalidateBookUpdate(queryClient, variables.id);
    },
  });
};
