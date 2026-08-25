import { createFileRoute } from "@tanstack/react-router";
import { BookImportPage } from "../../features/books/import/BookImportPage";

export const Route = createFileRoute("/books/import")({
  component: BookImportPage,
});
