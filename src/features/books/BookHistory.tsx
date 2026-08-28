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
import { useBookRevisions } from "./api/useBookRevisions";
import { BooleanValue } from "../../components/utils/BooleanValue";
import type { BookQuery } from "../../generated/graphql-request";

type BookAuthors = NonNullable<BookQuery["book"]>["authors"];

type BookHistoryProps = {
  bookId: string;
  authors: BookAuthors;
};

export const BookHistory: React.FC<BookHistoryProps> = ({
  bookId,
  authors,
}) => {
  const theme = useMantineTheme();
  const isMd = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const isLg = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const { data, isLoading, error } = useBookRevisions(bookId);
  const [selectedRevisionNumber, setSelectedRevisionNumber] = useState<
    number | null
  >(null);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error != null) {
    return <Text>Error loading history</Text>;
  }

  if (data == null || data.bookRevisions.length === 0) {
    return null;
  }

  const selectedRevision = data.bookRevisions.find(
    (revision) => revision.revisionNumber === selectedRevisionNumber,
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
            <Table.Th>Revision</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Authors</Table.Th>
            {isMd && <Table.Th>ISBN</Table.Th>}
            {isMd && <Table.Th>Format</Table.Th>}
            {isLg && <Table.Th>Store</Table.Th>}
            {isLg && <Table.Th>Read</Table.Th>}
            {isLg && <Table.Th>Owned</Table.Th>}
            <Table.Th>Detail</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.bookRevisions.map((revision) => (
            <Table.Tr key={revision.revisionNumber}>
              <Table.Td>{revision.revisionNumber}</Table.Td>
              <Table.Td>
                {dayjs(revision.createdAt).format("YYYY/MM/DD HH:mm:ss")}
              </Table.Td>
              <Table.Td>{revision.title}</Table.Td>
              <Table.Td>{resolveAuthorNames(revision.authorIds)}</Table.Td>
              {isMd && <Table.Td>{revision.isbn}</Table.Td>}
              {isMd && <Table.Td>{revision.format}</Table.Td>}
              {isLg && <Table.Td>{revision.store}</Table.Td>}
              {isLg && (
                <Table.Td>
                  <BooleanValue flag={revision.read} />
                </Table.Td>
              )}
              {isLg && (
                <Table.Td>
                  <BooleanValue flag={revision.owned} />
                </Table.Td>
              )}
              <Table.Td>
                <ActionIcon
                  onClick={() => {
                    setSelectedRevisionNumber(revision.revisionNumber);
                  }}
                  variant="subtle"
                  aria-label="View revision detail"
                >
                  <IconEye />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={selectedRevisionNumber != null}
        onClose={() => {
          setSelectedRevisionNumber(null);
        }}
        title="Revision Detail"
      >
        {selectedRevision != null && (
          <div>
            <Text>
              <strong>Revision:</strong> {selectedRevision.revisionNumber}
            </Text>
            <Text>
              <strong>Date:</strong>{" "}
              {dayjs(selectedRevision.createdAt).format("YYYY/MM/DD HH:mm:ss")}
            </Text>
            <Text>
              <strong>Title:</strong> {selectedRevision.title}
            </Text>
            <Text>
              <strong>Authors:</strong>{" "}
              {resolveAuthorNames(selectedRevision.authorIds)}
            </Text>
            <Text>
              <strong>ISBN:</strong> {selectedRevision.isbn}
            </Text>
            <Text>
              <strong>Format:</strong> {selectedRevision.format}
            </Text>
            <Text>
              <strong>Store:</strong> {selectedRevision.store}
            </Text>
            <Text>
              <strong>Read:</strong>{" "}
              <BooleanValue flag={selectedRevision.read} />
            </Text>
            <Text>
              <strong>Owned:</strong>{" "}
              <BooleanValue flag={selectedRevision.owned} />
            </Text>
            <Text>
              <strong>Priority:</strong> {selectedRevision.priority}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};
