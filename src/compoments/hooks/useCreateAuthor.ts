import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createGraphQLClient } from "../../lib/graphqlClient";
import { isDemoMode } from "../../config";
import type { CreateAuthorInput } from "../../generated/graphql";

export const useCreateAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorData: CreateAuthorInput) => {
      if (isDemoMode) {
        const sdk = createGraphQLClient();
        return sdk.createAuthor({ authorData });
      }
      const token = await getAccessTokenSilently();
      const sdk = createGraphQLClient(token);
      return sdk.createAuthor({ authorData });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
};
