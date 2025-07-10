import { createFileRoute } from "@tanstack/react-router";
import { BookDetailPage } from "../../pages/books/BookDetailPage";

export const Route = createFileRoute("/books/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BookDetailPage />;
}
