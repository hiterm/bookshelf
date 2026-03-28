import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";
import type { CreateBookInput } from "../../generated/graphql-request";

export const useCreateBook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: CreateBookInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.createBook({ bookData });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
