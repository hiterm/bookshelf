import { Accordion, Box, Group, Stack, Text, Title } from "@mantine/core";
import type { OperationQuery } from "../../generated/graphql-request";
import { formatOperationTime } from "./OperationList";
import { displayOperationType } from "./operationType";

type Operation = NonNullable<OperationQuery["operation"]>;
type BookChange = Operation["bookChanges"][number];
type AuthorChange = Operation["authorChanges"][number];

const value = (input: unknown): React.ReactNode => {
  if (input == null || input === "") return "-";
  if (typeof input === "boolean") return input ? "はい" : "いいえ";
  if (Array.isArray(input)) return input.length > 0 ? input.join(", ") : "-";
  if (typeof input === "string" || typeof input === "number") return input;
  return JSON.stringify(input);
};

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

const BookRevision: React.FC<{
  label: string;
  revision: BookChange["beforeRevision"];
}> = ({ label, revision }) =>
  revision == null ? null : (
    <Box mt="md">
      <Text fw={700} mb="xs">
        {label}
      </Text>
      <Fields
        fields={[
          ["リビジョン", revision.revisionNumber],
          ["タイトル", value(revision.title)],
          ["著者ID", value(revision.authorIds)],
          ["ISBN", value(revision.isbn)],
          ["読了", value(revision.read)],
          ["所有", value(revision.owned)],
          ["優先度", value(revision.priority)],
          ["形式", value(revision.format)],
          ["ストア", value(revision.store)],
          ["購入日", value(revision.purchaseDate)],
          ["書籍作成日時", formatOperationTime(revision.bookCreatedAt)],
          ["書籍更新日時", formatOperationTime(revision.bookUpdatedAt)],
          ["履歴作成日時", formatOperationTime(revision.createdAt)],
        ]}
      />
    </Box>
  );

const AuthorRevision: React.FC<{
  label: string;
  revision: AuthorChange["beforeRevision"];
}> = ({ label, revision }) =>
  revision == null ? null : (
    <Box mt="md">
      <Text fw={700} mb="xs">
        {label}
      </Text>
      <Fields
        fields={[
          ["リビジョン", revision.revisionNumber],
          ["名前", value(revision.name)],
          ["読み仮名", value(revision.yomi)],
          ["著者作成日時", formatOperationTime(revision.authorCreatedAt)],
          ["著者更新日時", formatOperationTime(revision.authorUpdatedAt)],
          ["履歴作成日時", formatOperationTime(revision.createdAt)],
        ]}
      />
    </Box>
  );

const BookChanges: React.FC<{ changes: BookChange[] }> = ({ changes }) => (
  <section>
    <Title order={2} size="h3" mb="sm">
      書籍 ({changes.length})
    </Title>
    <Accordion>
      {changes.map((change) => {
        const revision = change.afterRevision ?? change.beforeRevision;
        return (
          <Accordion.Item key={change.bookId} value={change.bookId}>
            <Accordion.Control>
              {revision?.title ?? change.bookId}
            </Accordion.Control>
            <Accordion.Panel>
              <BookRevision label="変更前" revision={change.beforeRevision} />
              <BookRevision label="変更後" revision={change.afterRevision} />
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  </section>
);

const AuthorChanges: React.FC<{ changes: AuthorChange[] }> = ({ changes }) => (
  <section>
    <Title order={2} size="h3" mb="sm">
      著者 ({changes.length})
    </Title>
    <Accordion>
      {changes.map((change) => {
        const revision = change.afterRevision ?? change.beforeRevision;
        return (
          <Accordion.Item key={change.authorId} value={change.authorId}>
            <Accordion.Control>
              {revision?.name ?? change.authorId}
            </Accordion.Control>
            <Accordion.Panel>
              <AuthorRevision label="変更前" revision={change.beforeRevision} />
              <AuthorRevision label="変更後" revision={change.afterRevision} />
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  </section>
);

export const OperationDetail: React.FC<{ operation: Operation }> = ({
  operation,
}) => (
  <Stack gap="xl">
    <Box>
      <Title order={1}>{displayOperationType(operation.type)}</Title>
      <Text c="dimmed">{formatOperationTime(operation.createdAt)}</Text>
      {operation.detail != null && (
        <Box component="details" mt="md">
          <Text component="summary" fw={600} style={{ cursor: "pointer" }}>
            追加情報
          </Text>
          <Box component="pre" p="sm" bg="gray.0" style={{ overflowX: "auto" }}>
            {JSON.stringify(operation.detail, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
    {operation.bookChanges.length > 0 && (
      <BookChanges changes={operation.bookChanges} />
    )}
    {operation.authorChanges.length > 0 && (
      <AuthorChanges changes={operation.authorChanges} />
    )}
  </Stack>
);
