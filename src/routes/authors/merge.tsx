import { createFileRoute } from "@tanstack/react-router";
import { AuthorMergePage } from "../../features/authors/AuthorMergePage";

export const Route = createFileRoute("/authors/merge")({
  component: AuthorMergePage,
});
