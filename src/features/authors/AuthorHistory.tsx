import {
  ActionIcon,
  Modal,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useAuthorEvents } from "../../compoments/hooks/useAuthorEvents";

export const AuthorHistory: React.FC<{ authorId: string }> = ({ authorId }) => {
  const theme = useMantineTheme();
  const isMd = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const { data, isLoading, error } = useAuthorEvents(authorId);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading history</Text>;
  }

  if (!data || data.authorEvents.length === 0) {
    return null;
  }

  const selectedEvent = data.authorEvents.find(
    (e) => e.eventId === selectedEventId,
  );

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
            <Table.Th>Name</Table.Th>
            {isMd && <Table.Th>Yomi</Table.Th>}
            <Table.Th>Detail</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.authorEvents.map((event) => (
            <Table.Tr key={event.eventId}>
              <Table.Td>{event.operation}</Table.Td>
              <Table.Td>
                {dayjs(event.changedAt * 1000).format("YYYY/MM/DD HH:mm:ss")}
              </Table.Td>
              <Table.Td>{event.name}</Table.Td>
              {isMd && <Table.Td>{event.yomi ?? "-"}</Table.Td>}
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
              <strong>Name:</strong> {selectedEvent.name}
            </Text>
            <Text>
              <strong>Yomi:</strong> {selectedEvent.yomi ?? "-"}
            </Text>
            {selectedEvent.extra != null && (
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
