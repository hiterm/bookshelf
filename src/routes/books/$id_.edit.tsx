import { createFileRoute } from "@tanstack/react-router";
import { BookDetailEditPage } from "../../pages/books/BookDetailEditPage";

export const Route = createFileRoute("/books/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookDetailEditPage />;
}
