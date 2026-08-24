import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateAuthorInput } from "../../../generated/graphql-request";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { authorQueryKeys } from "./queryKeys";

export const useUpdateAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorData: UpdateAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.updateAuthor({ authorData });
    },
    onSuccess: (_, authorData) => {
      void queryClient.invalidateQueries({ queryKey: authorQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: authorQueryKeys.detail(authorData.id),
      });
    },
  });
};
