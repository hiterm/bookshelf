import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@tanstack/react-query";
import type { ImportBookInput } from "../../generated/graphql-request";
import { createAuthenticatedSdk } from "../../lib/graphqlClient";

export const usePreviewBookImport = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (books: ImportBookInput[]) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.previewBookImport({ books });
    },
  });
};
