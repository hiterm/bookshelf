import type {
  UpdateAuthorMutation,
  UpdateAuthorInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateAuthorUpdate } from "./invalidation";

export const useUpdateAuthor = (): UseMutationResult<
  UpdateAuthorMutation,
  Error,
  UpdateAuthorInput
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorData: UpdateAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.updateAuthor({ authorData });
    },
    onSuccess: (_, authorData) => {
      invalidateAuthorUpdate(queryClient, authorData.id);
    },
  });
};
