import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";
import { historyQueryKeys } from "./queryKeys";

export const useEventSet = (eventSetId: string) => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: historyQueryKeys.detail(eventSetId),
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.eventSet({ id: eventSetId });
    },
  });
};
