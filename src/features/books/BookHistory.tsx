import { ActionIcon, Modal, Table, Text, Title } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useBookEvents } from "../../compoments/hooks/useBookEvents";
import { ShowBoolean } from "../../compoments/utils/ShowBoolean";
import { Author } from "../../generated/graphql-request";

type BookHistoryProps = {
  bookId: string;
  authors: Author[];
};

export const BookHistory: React.FC<BookHistoryProps> = ({
  bookId,
  authors,
}) => {
  const { data, isLoading, error } = useBookEvents(bookId);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading history</Text>;
  }

  if (!data || data.bookEvents.length === 0) {
    return null;
  }

  const selectedEvent = data.bookEvents.find(
    (e) => e.eventId === selectedEventId,
  );

  const authorMap = new Map(authors.map((a) => [a.id, a.name]));

  const resolveAuthorNames = (authorIds: string[]) => {
    return authorIds.map((id) => authorMap.get(id) ?? id).join(", ");
  };

  return (
    <div>
      <Title order={2} mt="xl" mb="md">
        History
      </Title>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Operation</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Detail</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.bookEvents.map((event) => (
            <Table.Tr key={event.eventId}>
              <Table.Td>{event.operation}</Table.Td>
              <Table.Td>
                {dayjs(event.changedAt * 1000).format("YYYY/MM/DD HH:mm:ss")}
              </Table.Td>
              <Table.Td>{event.title}</Table.Td>
              <Table.Td>
                <ActionIcon
                  onClick={() => {
                    setSelectedEventId(event.eventId);
                  }}
                  variant="subtle"
                  aria-label="View event detail"
                >
                  <IconEye />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={selectedEventId != null}
        onClose={() => {
          setSelectedEventId(null);
        }}
        title="Event Detail"
      >
        {selectedEvent && (
          <div>
            <Text>
              <strong>Operation:</strong> {selectedEvent.operation}
            </Text>
            <Text>
              <strong>Date:</strong>{" "}
              {dayjs(selectedEvent.changedAt * 1000).format(
                "YYYY/MM/DD HH:mm:ss",
              )}
            </Text>
            <Text>
              <strong>Title:</strong> {selectedEvent.title}
            </Text>
            <Text>
              <strong>Authors:</strong>{" "}
              {resolveAuthorNames(selectedEvent.authorIds)}
            </Text>
            <Text>
              <strong>ISBN:</strong> {selectedEvent.isbn}
            </Text>
            <Text>
              <strong>Format:</strong> {selectedEvent.format}
            </Text>
            <Text>
              <strong>Store:</strong> {selectedEvent.store}
            </Text>
            <Text>
              <strong>Read:</strong>{" "}
              {selectedEvent.read != null ? (
                <ShowBoolean flag={selectedEvent.read} />
              ) : null}
            </Text>
            <Text>
              <strong>Owned:</strong>{" "}
              {selectedEvent.owned != null ? (
                <ShowBoolean flag={selectedEvent.owned} />
              ) : null}
            </Text>
            <Text>
              <strong>Priority:</strong> {selectedEvent.priority ?? "-"}
            </Text>
            {selectedEvent.extra && (
              <Text>
                <strong>Extra:</strong> {JSON.stringify(selectedEvent.extra)}
              </Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
