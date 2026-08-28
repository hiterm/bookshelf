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
import { useAuthorRevisions } from "./api/useAuthorRevisions";

export const AuthorHistory: React.FC<{ authorId: string }> = ({ authorId }) => {
  const theme = useMantineTheme();
  const isMd = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const { data, isLoading, error } = useAuthorRevisions(authorId);
  const [selectedRevisionNumber, setSelectedRevisionNumber] = useState<
    number | null
  >(null);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error != null) {
    return <Text>Error loading history</Text>;
  }

  if (data == null || data.authorRevisions.length === 0) {
    return null;
  }

  const selectedRevision = data.authorRevisions.find(
    (revision) => revision.revisionNumber === selectedRevisionNumber,
  );

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
            <Table.Th>Name</Table.Th>
            {isMd && <Table.Th>Yomi</Table.Th>}
            <Table.Th>Detail</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.authorRevisions.map((revision) => (
            <Table.Tr key={revision.revisionNumber}>
              <Table.Td>{revision.revisionNumber}</Table.Td>
              <Table.Td>
                {dayjs(revision.createdAt).format("YYYY/MM/DD HH:mm:ss")}
              </Table.Td>
              <Table.Td>{revision.name}</Table.Td>
              {isMd && (
                <Table.Td>
                  {revision.yomi === "" ? "-" : revision.yomi}
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
              <strong>Name:</strong> {selectedRevision.name}
            </Text>
            <Text>
              <strong>Yomi:</strong>{" "}
              {selectedRevision.yomi === "" ? "-" : selectedRevision.yomi}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};
