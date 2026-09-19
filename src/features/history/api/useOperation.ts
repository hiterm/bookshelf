import type { OperationQuery } from "../../../generated/graphql-request";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { historyQueryKeys } from "./queryKeys";

export const useOperation = (
  operationId: string,
): UseQueryResult<OperationQuery> => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: historyQueryKeys.detail(operationId),
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.operation({ id: operationId });
    },
  });
};
