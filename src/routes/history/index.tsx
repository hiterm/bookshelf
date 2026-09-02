import { createFileRoute } from "@tanstack/react-router";
import { HistoryIndexPage } from "./-HistoryIndexPage";

export const Route = createFileRoute("/history/")({
  component: HistoryIndexPage,
});
