import { Accordion, Box, Group, Stack, Text, Title } from "@mantine/core";
import type { EventSetQuery } from "../../generated/graphql-request";
import { formatEventTime } from "./EventSetList";
import {
  displayEventOperation,
  displayEventSetOperation,
} from "./eventSetOperation";

type EventSet = NonNullable<EventSetQuery["eventSet"]>;
type BookEvent = EventSet["bookEvents"][number];
type AuthorEvent = EventSet["authorEvents"][number];

const value = (input: unknown): React.ReactNode => {
  if (input == null || input === "") return "-";
  if (typeof input === "boolean") return input ? "はい" : "いいえ";
  if (Array.isArray(input)) return input.length > 0 ? input.join(", ") : "-";
  if (typeof input === "string" || typeof input === "number") return input;
  return JSON.stringify(input);
};

const timestamp = (input: number | null): string =>
  input == null ? "-" : formatEventTime(input);

const Fields: React.FC<{ fields: [string, React.ReactNode][] }> = ({
  fields,
}) => (
  <Stack gap="xs">
    {fields.map(([label, fieldValue]) => (
      <Group key={label} align="flex-start" wrap="nowrap">
        <Text fw={600} w={140}>
          {label}
        </Text>
        <Text>{fieldValue}</Text>
      </Group>
    ))}
  </Stack>
);

const Extra: React.FC<{ extra: unknown }> = ({ extra }) =>
  extra == null ? null : (
    <Box component="details" mt="md">
      <Text component="summary" fw={600} style={{ cursor: "pointer" }}>
        追加情報
      </Text>
      <Box component="pre" p="sm" bg="gray.0" style={{ overflowX: "auto" }}>
        {JSON.stringify(extra, null, 2)}
      </Box>
    </Box>
  );

const BookEvents: React.FC<{ events: BookEvent[] }> = ({ events }) => (
  <section>
    <Title order={2} size="h3" mb="sm">
      書籍 ({events.length})
    </Title>
    <Accordion>
      {events.map((event) => (
        <Accordion.Item key={event.eventId} value={event.eventId}>
          <Accordion.Control>
            {displayEventOperation(event.operation)}:{" "}
            {event.title ?? event.bookId}
          </Accordion.Control>
          <Accordion.Panel>
            <Fields
              fields={[
                ["タイトル", value(event.title)],
                ["著者ID", value(event.authorIds)],
                ["ISBN", value(event.isbn)],
                ["読了", value(event.read)],
                ["所有", value(event.owned)],
                ["優先度", value(event.priority)],
                ["形式", value(event.format)],
                ["ストア", value(event.store)],
                ["書籍作成日時", timestamp(event.bookCreatedAt)],
                ["書籍更新日時", timestamp(event.bookUpdatedAt)],
                ["変更日時", formatEventTime(event.changedAt)],
              ]}
            />
            <Extra extra={event.extra} />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  </section>
);

const AuthorEvents: React.FC<{ events: AuthorEvent[] }> = ({ events }) => (
  <section>
    <Title order={2} size="h3" mb="sm">
      著者 ({events.length})
    </Title>
    <Accordion>
      {events.map((event) => (
        <Accordion.Item key={event.eventId} value={event.eventId}>
          <Accordion.Control>
            {displayEventOperation(event.operation)}:{" "}
            {event.name ?? event.authorId}
          </Accordion.Control>
          <Accordion.Panel>
            <Fields
              fields={[
                ["名前", value(event.name)],
                ["読み仮名", value(event.yomi)],
                ["著者作成日時", timestamp(event.authorCreatedAt)],
                ["著者更新日時", timestamp(event.authorUpdatedAt)],
                ["変更日時", formatEventTime(event.changedAt)],
              ]}
            />
            <Extra extra={event.extra} />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  </section>
);

export const EventSetDetail: React.FC<{ eventSet: EventSet }> = ({
  eventSet,
}) => (
  <Stack gap="xl">
    <Box>
      <Title order={1}>{displayEventSetOperation(eventSet.operation)}</Title>
      <Text c="dimmed">{formatEventTime(eventSet.createdAt)}</Text>
    </Box>
    {eventSet.bookEvents.length > 0 && (
      <BookEvents events={eventSet.bookEvents} />
    )}
    {eventSet.authorEvents.length > 0 && (
      <AuthorEvents events={eventSet.authorEvents} />
    )}
  </Stack>
);
