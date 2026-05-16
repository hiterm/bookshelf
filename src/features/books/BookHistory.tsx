import { Table, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import { useBookEvents } from "../../compoments/hooks/useBookEvents";
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

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading history</Text>;
  }

  if (!data || data.bookEvents.length === 0) {
    return null;
  }

  const authorMap = new Map(authors.map((a) => [a.id, a.name]));

  const resolveAuthorNames = (authorIds: string[]) => {
    return authorIds.map((id) => authorMap.get(id) ?? id).join(", ");
  };

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
            <Table.Th>Title</Table.Th>
            <Table.Th>Authors</Table.Th>
            <Table.Th>Format</Table.Th>
            <Table.Th>Store</Table.Th>
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
              <Table.Td>{resolveAuthorNames(event.authorIds)}</Table.Td>
              <Table.Td>{event.format}</Table.Td>
              <Table.Td>{event.store}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};
