import { Table, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import { useAuthorEvents } from "../../compoments/hooks/useAuthorEvents";

export const AuthorHistory: React.FC<{ authorId: string }> = ({ authorId }) => {
  const { data, isLoading, error } = useAuthorEvents(authorId);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading history</Text>;
  }

  if (!data || data.authorEvents.length === 0) {
    return null;
  }

  return (
    <div>
      <Title order={2} mt="xl" mb="md">
        History
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Operation</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Yomi</Table.Th>
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
              <Table.Td>{event.yomi}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};
