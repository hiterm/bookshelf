import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";
import type { UpdateBookInput } from "../../generated/graphql";

export const useUpdateBook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: UpdateBookInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.updateBook({ bookData });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["books"] });
      void queryClient.invalidateQueries({ queryKey: ["book", variables.id] });
    },
  });
};
