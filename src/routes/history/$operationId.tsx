import { createFileRoute } from "@tanstack/react-router";
import { HistoryDetailPage } from "./-HistoryDetailPage";

export const Route = createFileRoute("/history/$operationId")({
  component: HistoryDetailRoute,
});

function HistoryDetailRoute() {
  const { operationId } = Route.useParams();
  return <HistoryDetailPage operationId={operationId} />;
}
