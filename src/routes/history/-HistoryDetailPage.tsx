import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { Link } from "../../components/mantineTsr";
import { useOperation } from "../../features/history/api/useOperation";
import { OperationDetail } from "../../features/history/OperationDetail";

export function HistoryDetailPage({ operationId }: { operationId: string }) {
  const { data, isLoading, error } = useOperation(operationId);
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
  if (data.operation == null) {
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
      <OperationDetail operation={data.operation} />
    </Stack>
  );
}
