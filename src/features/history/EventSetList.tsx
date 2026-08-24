import { Paper, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { Link } from "../../compoments/mantineTsr";
import type { EventSetsQuery } from "../../generated/graphql-request";
import { displayEventSetOperation } from "./eventSetOperation";

type EventSetListProps = { eventSets: EventSetsQuery["eventSets"] };

export const formatEventTime = (timestamp: number): string =>
  dayjs(timestamp * 1000).format("YYYY/MM/DD HH:mm:ss");

export const EventSetList: React.FC<EventSetListProps> = ({ eventSets }) => {
  if (eventSets.length === 0) {
    return <Text c="dimmed">変更履歴はありません</Text>;
  }

  return (
    <Stack gap="sm">
      {eventSets.map((eventSet) => (
        <Paper key={eventSet.id} withBorder p="md">
          <Link
            to="/history/$eventSetId"
            params={{ eventSetId: eventSet.id }}
            underline="never"
            aria-label={`${displayEventSetOperation(eventSet.operation)}の詳細`}
          >
            <Title order={3} size="h5">
              {displayEventSetOperation(eventSet.operation)}
            </Title>
            <Text c="dimmed" size="sm">
              {formatEventTime(eventSet.createdAt)}
            </Text>
          </Link>
        </Paper>
      ))}
    </Stack>
  );
};
