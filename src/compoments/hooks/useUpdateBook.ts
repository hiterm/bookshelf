import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createGraphQLClient } from "../../lib/graphqlClient";
import { isDemoMode } from "../../config";
import type { UpdateBookInput } from "../../generated/graphql";

export const useUpdateBook = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: UpdateBookInput) => {
      if (isDemoMode) {
        const sdk = createGraphQLClient();
        return sdk.updateBook({ bookData });
      }
      const token = await getAccessTokenSilently();
      const sdk = createGraphQLClient(token);
      return sdk.updateBook({ bookData });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["books"] });
      void queryClient.invalidateQueries({ queryKey: ["book", variables.id] });
    },
  });
};
