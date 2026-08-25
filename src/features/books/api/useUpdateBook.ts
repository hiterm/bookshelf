import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import type { UpdateBookInput } from "../../../generated/graphql-request";
import { bookQueryKeys } from "./queryKeys";

export const useUpdateBook = () => {
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
