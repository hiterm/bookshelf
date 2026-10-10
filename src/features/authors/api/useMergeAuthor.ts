import type { MergeAuthorMutation } from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { invalidateAuthorMerge } from "./invalidation";

export type MergeAuthorInput = {
  sourceAuthorId: string;
  destinationAuthorId: string;
};

export const useMergeAuthor = (): UseMutationResult<
  MergeAuthorMutation,
  Error,
  MergeAuthorInput
> => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MergeAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.mergeAuthor(input);
    },
    onSuccess: (_, input) => {
      invalidateAuthorMerge(
        queryClient,
        input.sourceAuthorId,
        input.destinationAuthorId,
      );
    },
  });
};
