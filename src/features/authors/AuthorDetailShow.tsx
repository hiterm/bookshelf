import {
  Box,
  Button,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconArrowBack } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { useDeleteAuthor } from "../../compoments/hooks/useDeleteAuthor";
import { LinkButton } from "../../compoments/mantineTsr";

type Author = {
  id: string;
  name: string;
};

const DeleteButton: React.FC<{ author: Author }> = ({ author }) => {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteAuthor();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await mutation.mutateAsync(author.id);
      await navigate({ to: "/authors" });
      showNotification({
        message: `${author.name}が削除されました`,
        color: "teal",
      });
    } catch (error) {
      showNotification({
        message: `削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        color: "red",
      });
    }
  };

  return (
    <div>
      <Button
        color="red"
        onClick={() => {
          setOpen(true);
        }}
      >
        削除
      </Button>
      <Modal
        opened={open}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <Title order={3} id="delete-dialog-title">
          削除確認
        </Title>
        <Box id="delete-dialog-description">{author.name}を削除しますか？</Box>
        <Center mt="md">
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={() => {
              void handleDelete();
            }}
            color="red"
            autoFocus
            ml="sm"
          >
            削除する
          </Button>
        </Center>
      </Modal>
    </div>
  );
};

export const AuthorDetailShow: React.FC<{ author: Author }> = ({ author }) => {
  return (
    <React.Fragment>
      <LinkButton
        leftSection={<IconArrowBack />}
        variant="outline"
        m={20}
        linkOptions={{ to: "/authors" }}
      >
        Back
      </LinkButton>
      <Stack m={20} gap="xs">
        <Title order={1}>{author.name}</Title>
        <Box>
          <Text fw="bold">名前</Text>
          <Text>{author.name}</Text>
        </Box>
      </Stack>
      <Group m={20}>
        <LinkButton
          color="blue"
          linkOptions={{
            to: "/authors/$id/edit",
            params: { id: author.id },
          }}
        >
          変更
        </LinkButton>
        <DeleteButton author={author} />
      </Group>
    </React.Fragment>
  );
};
