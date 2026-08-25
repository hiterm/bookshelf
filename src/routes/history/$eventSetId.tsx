import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEventSet } from "../../features/history/api/useEventSet";
import { Link } from "../../components/mantineTsr";
import { EventSetDetail } from "../../features/history/EventSetDetail";

export const Route = createFileRoute("/history/$eventSetId")({
  component: HistoryDetailRoute,
});

function HistoryDetailRoute() {
  const { eventSetId } = Route.useParams();
  return <HistoryDetailPage eventSetId={eventSetId} />;
}

export function HistoryDetailPage({ eventSetId }: { eventSetId: string }) {
  const { data, isLoading, error } = useEventSet(eventSetId);
  if (error != null) {
    return <Alert color="red">変更履歴を読み込めませんでした</Alert>;
  }
  if (isLoading || data == null) {
    return (
      <Center>
        <Loader aria-label="変更履歴を読み込み中" />
      </Center>
    );
  }
  if (data.eventSet == null) {
    return (
      <Stack>
        <Text>変更履歴が見つかりません</Text>
        <Link to="/history">変更履歴へ戻る</Link>
      </Stack>
    );
  }
  return (
    <Stack>
      <Link to="/history">変更履歴へ戻る</Link>
      <EventSetDetail eventSet={data.eventSet} />
    </Stack>
  );
}
