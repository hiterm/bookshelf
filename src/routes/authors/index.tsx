import { createFileRoute } from "@tanstack/react-router";
import { AuthorIndexPage } from "../../pages/authors/AuthorIndexPage";

export const Route = createFileRoute("/authors/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthorIndexPage />;
}
