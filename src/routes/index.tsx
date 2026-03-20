import { createFileRoute, redirect } from "@tanstack/react-router";
import { isDemoMode } from "../config";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (isDemoMode || context.auth.isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/books" });
    }
  },
  component: () => null,
});
