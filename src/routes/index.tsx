import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  // To avoid auth0 issue
  // https://github.com/TanStack/router/discussions/1322
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/books" });
  });
  return <div />;
}
