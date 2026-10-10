import type {
  CreateBookMutation,
  CreateBookInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateBookCreate } from "./invalidation";

export const useCreateBook = (): UseMutationResult<
  CreateBookMutation,
  Error,
  CreateBookInput
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: CreateBookInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.createBook({ bookData });
    },
    onSuccess: () => {
      invalidateBookCreate(queryClient);
    },
  });
};
