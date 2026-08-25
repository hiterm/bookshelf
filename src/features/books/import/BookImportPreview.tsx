import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import type { PreviewBookImportMutation } from "../../../generated/graphql-request";

type Props = {
  preview: PreviewBookImportMutation["previewBookImport"];
  importing: boolean;
  onBack: () => void;
  onImport: () => void;
};

export const BookImportPreview = ({
  preview,
  importing,
  onBack,
  onImport,
}: Props) => {
  const authors = preview.books.flatMap((book) => book.authors);
  const existing = authors.filter(
    (author) => author.status === "EXISTING",
  ).length;
  const newlyCreated = authors.filter(
    (author) => author.status === "NEW",
  ).length;

  return (
    <Stack>
      <Title order={2}>インポートプレビュー</Title>
      <Group>
        <Text>{preview.books.length}冊をインポート</Text>
        <Text>新規著者: {newlyCreated}</Text>
        <Text>既存著者: {existing}</Text>
      </Group>
      {preview.books.map((book, index) => (
        <Stack
          key={`${book.title}-${String(index)}`}
          gap={4}
          p="sm"
          bd="1px solid var(--mantine-color-gray-3)"
        >
          <Text fw={600}>{book.title}</Text>
          <Group gap="xs">
            {book.authors.map((author) => (
              <Group key={`${author.name}-${author.status}`} gap={4}>
                <Text size="sm">{author.name}</Text>
                <Badge
                  size="sm"
                  color={author.status === "EXISTING" ? "blue" : "green"}
                >
                  {author.status === "EXISTING" ? "既存" : "新規"}
                </Badge>
              </Group>
            ))}
          </Group>
          <Text size="sm">
            {book.read ? "既読" : "未読"} / {book.owned ? "所有" : "未所有"} /
            優先度: {book.priority} / {book.format} / {book.store}
          </Text>
        </Stack>
      ))}
      <Group justify="flex-end">
        <Button variant="default" onClick={onBack} disabled={importing}>
          入力・設定に戻る
        </Button>
        <Button onClick={onImport} disabled={importing} loading={importing}>
          インポート
        </Button>
      </Group>
    </Stack>
  );
};
