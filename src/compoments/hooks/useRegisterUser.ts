import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { createGraphQLClient } from "../../lib/graphqlClient";
import { isDemoMode } from "../../config";

export const useRegisterUser = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isDemoMode) {
        const sdk = createGraphQLClient();
        return sdk.registerUser();
      }
      const token = await getAccessTokenSilently();
      const sdk = createGraphQLClient(token);
      return sdk.registerUser();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loggedInUser"] });
    },
  });
};
