import { Paper, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { Link } from "../../components/mantineTsr";
import type { OperationsQuery } from "../../generated/graphql-request";
import { displayOperationType } from "./operationType";

type OperationListProps = { operations: OperationsQuery["operations"] };

export const formatOperationTime = (timestamp: string): string =>
  dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");

export const OperationList: React.FC<OperationListProps> = ({ operations }) => {
  if (operations.length === 0) {
    return <Text c="dimmed">変更履歴はありません</Text>;
  }

  return (
    <Stack gap="sm">
      {operations.map((operation) => (
        <Paper key={operation.id} withBorder p="md">
          <Link
            to="/history/$operationId"
            params={{ operationId: operation.id }}
            underline="never"
            aria-label={`${displayOperationType(operation.type)}の詳細`}
          >
            <Title order={3} size="h5">
              {displayOperationType(operation.type)}
            </Title>
            <Text c="dimmed" size="sm">
              {formatOperationTime(operation.createdAt)}
            </Text>
          </Link>
        </Paper>
      ))}
    </Stack>
  );
};
