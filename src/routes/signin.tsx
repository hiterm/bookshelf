import { createFileRoute } from "@tanstack/react-router";
import { SignInScreen } from "../features/auth/SignInScreen";

export const Route = createFileRoute("/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInScreen />;
}
