import { createFileRoute, redirect } from "@tanstack/react-router";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (isDemoMode || context.auth.isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/books" });
    }
  },
  component: () => null,
});
