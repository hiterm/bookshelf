import type {
  CreateBookMutation,
  CreateBookInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "../../authors/api/queryKeys";
import { bookQueryKeys } from "./queryKeys";

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
      void queryClient.invalidateQueries({ queryKey: authorQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: authorQueryKeys.details });
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
    },
  });
};
