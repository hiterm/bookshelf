import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";

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
      void queryClient.invalidateQueries({ queryKey: ["authors"] });
      void queryClient.invalidateQueries({
        queryKey: ["author", input.sourceAuthorId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["author", input.destinationAuthorId],
      });
      void queryClient.invalidateQueries({ queryKey: ["authorEvents"] });
      void queryClient.invalidateQueries({ queryKey: ["books"] });
      void queryClient.invalidateQueries({ queryKey: ["book"] });
      void queryClient.invalidateQueries({ queryKey: ["bookEvents"] });
    },
  });
};
