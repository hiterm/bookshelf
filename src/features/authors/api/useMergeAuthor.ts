import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { bookQueryKeys } from "../../books/api/queryKeys";
import { authorQueryKeys } from "./queryKeys";

export type MergeAuthorInput = {
  sourceAuthorId: string;
  destinationAuthorId: string;
};

export const useMergeAuthor = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MergeAuthorInput) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.mergeAuthor(input);
    },
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: authorQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: authorQueryKeys.detail(input.sourceAuthorId),
      });
      void queryClient.invalidateQueries({
        queryKey: authorQueryKeys.detail(input.destinationAuthorId),
      });
      void queryClient.invalidateQueries({
        queryKey: authorQueryKeys.allEvents,
      });
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookQueryKeys.details });
      void queryClient.invalidateQueries({
        queryKey: bookQueryKeys.allEvents,
      });
    },
  });
};
