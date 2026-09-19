import { createFileRoute } from "@tanstack/react-router";
import { HistoryDetailPage } from "./-HistoryDetailPage";

export const Route = createFileRoute("/history/$operationId")({
  component: HistoryDetailRoute,
});

function HistoryDetailRoute(): React.JSX.Element {
  const { operationId } = Route.useParams();
  return <HistoryDetailPage operationId={operationId} />;
}
