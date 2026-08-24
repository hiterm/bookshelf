import { Alert, Center, Loader, Paper, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEventSets } from "../../features/history/api/useEventSets";
import { EventSetList } from "../../features/history/EventSetList";

export const Route = createFileRoute("/history/")({
  component: HistoryIndexPage,
});

export function HistoryIndexPage() {
  const { data, isLoading, error } = useEventSets();

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
  return (
    <Stack>
      <Title order={1}>変更履歴</Title>
      <Paper shadow="xs" p="lg">
        <EventSetList eventSets={data.eventSets} />
      </Paper>
    </Stack>
  );
}
