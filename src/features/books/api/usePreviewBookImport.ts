import type {
  PreviewBookImportMutation,
  ImportBookInput,
} from "../../../generated/graphql-request";
import type { UseMutationResult } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";

export const usePreviewBookImport = (): UseMutationResult<
  PreviewBookImportMutation,
  Error,
  ImportBookInput[]
> => {
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (books: ImportBookInput[]) => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.previewBookImport({ books });
    },
  });
};
