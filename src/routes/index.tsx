import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect({ to: "/books" });
  },
});
