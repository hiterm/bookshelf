import { createFileRoute } from "@tanstack/react-router";
import { BookIndexPage } from "../../pages/books/BookIndexPage";

export const Route = createFileRoute("/books/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookIndexPage />;
}
