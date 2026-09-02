import { Alert, Center, Loader, Paper, Stack, Title } from "@mantine/core";
import { useOperations } from "../../features/history/api/useOperations";
import { OperationList } from "../../features/history/OperationList";

export function HistoryIndexPage() {
  const { data, isLoading, error } = useOperations();

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
        <OperationList operations={data.operations} />
      </Paper>
    </Stack>
  );
}
