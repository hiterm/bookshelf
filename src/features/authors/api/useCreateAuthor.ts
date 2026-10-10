import type {
  CreateAuthorMutation,
  CreateAuthorInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateAuthorCreate } from "./invalidation";

export const useCreateAuthor = (): UseMutationResult<
  CreateAuthorMutation,
  Error,
  CreateAuthorInput
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorData: CreateAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.createAuthor({ authorData });
    },
    onSuccess: () => {
      invalidateAuthorCreate(queryClient);
    },
  });
};
