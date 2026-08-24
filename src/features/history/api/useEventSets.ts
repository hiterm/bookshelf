import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedSdk } from "../../../lib/graphqlClient";

export const useEventSets = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ["eventSets"],
    queryFn: async () => {
      const sdk = await createAuthenticatedSdk(getAccessTokenSilently);
      return sdk.eventSets();
    },
  });
};
