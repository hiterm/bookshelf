import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";
import type { CreateAuthorInput } from "../../generated/graphql-request";

export const useCreateAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorData: CreateAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.createAuthor({ authorData });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
};
