import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { useAuthor } from "./api/useAuthor";
import { useAuthors } from "./api/useAuthors";
import { useMergeAuthor } from "./api/useMergeAuthor";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { LinkButton } from "../../components/mantineTsr";
import { AuthorBookList } from "./AuthorBookList";

type AuthorPreviewProps = {
  authorId: string;
  title: string;
};

const AuthorPreview: React.FC<AuthorPreviewProps> = ({ authorId, title }) => {
  const { data, isLoading, error } = useAuthor(authorId);

  if (authorId === "") return null;
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader aria-label={`${title}を読み込み中`} />
      </Center>
    );
  }
  if (error != null) {
    return <Alert color="red">{title}の取得に失敗しました</Alert>;
  }
  if (data?.author == null) {
    return <Alert color="red">{title}が見つかりません</Alert>;
  }

  return (
    <AuthorBookList
      books={data.author.books}
      title={`${title}「${data.author.name}」の著書`}
    />
  );
};

export const AuthorMergePage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useAuthors();
  const mergeMutation = useMergeAuthor();
  const { reportError } = useAppError();
  const [sourceAuthorId, setSourceAuthorId] = useState("");
  const [destinationAuthorId, setDestinationAuthorId] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  if (error != null)
    return <Alert color="red">著者一覧の取得に失敗しました</Alert>;
  if (isLoading || data == null) {
    return (
      <Center>
        <Loader aria-label="著者一覧を読み込み中" />
      </Center>
    );
  }

  const options = data.authors.map((author) => ({
    value: author.id,
    label:
      author.yomi === "" ? author.name : `${author.name}（${author.yomi}）`,
  }));
  const source = data.authors.find((author) => author.id === sourceAuthorId);
  const destination = data.authors.find(
    (author) => author.id === destinationAuthorId,
  );
  const isSameAuthor =
    sourceAuthorId !== "" && sourceAuthorId === destinationAuthorId;
  const canMerge = source != null && destination != null && !isSameAuthor;

  const handleMerge = async () => {
    if (!canMerge || mergeMutation.isPending) return;
    try {
      const result = await mergeMutation.mutateAsync({
        sourceAuthorId,
        destinationAuthorId,
      });
      setConfirmationOpen(false);
      showNotification({
        message: `${source.name}を${destination.name}へ統合しました`,
        color: "teal",
      });
      await navigate({
        to: "/authors/$id",
        params: { id: result.mergeAuthor.author.id },
      });
    } catch (mutationError) {
      reportError({
        title: "著者の統合に失敗しました",
        operation: "MergeAuthor",
        error: mutationError,
      });
    }
  };

  return (
    <Stack m="md">
      <Group justify="space-between">
        <Title order={1}>著者を統合</Title>
        <LinkButton variant="outline" linkOptions={{ to: "/authors" }}>
          著者一覧へ戻る
        </LinkButton>
      </Group>
      <Alert color="yellow">
        統合元の著者は削除され、その著書はすべて統合先の著者へ移動します。この操作は取り消せません。
      </Alert>
      <Paper shadow="xs" p="md">
        <Stack>
          <Select
            label="統合元の著者"
            placeholder="削除する著者を検索"
            data={options}
            value={sourceAuthorId === "" ? null : sourceAuthorId}
            onChange={(value) => {
              setSourceAuthorId(value ?? "");
            }}
            searchable
            clearable
          />
          <Select
            label="統合先の著者"
            placeholder="残す著者を検索"
            data={options}
            value={destinationAuthorId === "" ? null : destinationAuthorId}
            onChange={(value) => {
              setDestinationAuthorId(value ?? "");
            }}
            searchable
            clearable
            error={isSameAuthor ? "同じ著者同士は統合できません" : undefined}
          />
          <Group>
            <Button
              color="red"
              disabled={!canMerge || mergeMutation.isPending}
              onClick={() => {
                setConfirmationOpen(true);
              }}
            >
              統合内容を確認
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Box>
        <AuthorPreview authorId={sourceAuthorId} title="統合元" />
        <AuthorPreview authorId={destinationAuthorId} title="統合先" />
      </Box>

      <Modal
        opened={confirmationOpen}
        onClose={() => {
          if (!mergeMutation.isPending) setConfirmationOpen(false);
        }}
        title="著者統合の確認"
        closeOnClickOutside={!mergeMutation.isPending}
        closeOnEscape={!mergeMutation.isPending}
      >
        {source != null && destination != null && (
          <Stack>
            <Text>
              「{source.name}」を削除し、すべての著書を「{destination.name}
              」へ移動します。
            </Text>
            <Text fw="bold">この操作は取り消せません。</Text>
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={mergeMutation.isPending}
                onClick={() => {
                  setConfirmationOpen(false);
                }}
              >
                キャンセル
              </Button>
              <Button
                color="red"
                loading={mergeMutation.isPending}
                onClick={() => void handleMerge()}
              >
                統合する
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};
