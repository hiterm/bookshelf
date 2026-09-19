import type {
  UpdateBookMutation,
  UpdateBookInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "./queryKeys";

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
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: bookQueryKeys.detail(variables.id),
      });
    },
  });
};
