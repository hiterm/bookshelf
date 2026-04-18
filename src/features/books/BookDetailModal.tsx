import {
  Button,
  Group,
  Image,
  Loader,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect } from "react";
import { BookSearchResult } from "./useBookSearch";
import { useOpenBdDetail } from "./useOpenBdDetail";

type BookDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  searchResult: BookSearchResult;
  onSelect: (result: BookSearchResult) => void;
};

export const BookDetailModal = ({
  opened,
  onClose,
  searchResult,
  onSelect,
}: BookDetailModalProps) => {
  const { state, fetch, reset } = useOpenBdDetail();

  useEffect(() => {
    if (opened && searchResult.isbn) {
      void fetch(searchResult.isbn);
    }
    if (!opened) {
      reset();
    }
  }, [opened, searchResult.isbn, fetch, reset]);

  const detail = state.status === "success" ? state.detail : null;
  const coverImageUrl =
    detail?.coverImageUrl ?? searchResult.coverImageUrl ?? null;

  const handleSelect = () => {
    onSelect(searchResult);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={searchResult.title}
      size="lg"
    >
      <Stack>
        {state.status === "loading" && <Loader />}
        <Group align="flex-start" wrap="nowrap">
          {coverImageUrl && (
            <Image
              src={coverImageUrl}
              width={120}
              fit="contain"
              style={{ flexShrink: 0 }}
            />
          )}
          <Stack gap="xs" style={{ flex: 1 }}>
            {(detail?.series || detail?.volume) && (
              <Text size="sm">
                {[detail?.series, detail?.volume].filter(Boolean).join(" ")}
              </Text>
            )}
            {searchResult.subtitle && (
              <Text size="sm" c="dimmed">
                {searchResult.subtitle}
              </Text>
            )}
            <Text>{searchResult.authorNames.join("、")}</Text>
            <Text size="sm" c="dimmed">
              {[
                searchResult.publisher,
                detail?.publishedDate ?? searchResult.publishedDate,
                searchResult.isbn,
              ]
                .filter(Boolean)
                .join("  ")}
            </Text>
            {detail?.genre && <Text size="sm">ジャンル: {detail.genre}</Text>}
            {detail?.format && <Text size="sm">判型: {detail.format}</Text>}
            {detail?.pageCount && (
              <Text size="sm">{detail.pageCount}ページ</Text>
            )}
          </Stack>
        </Group>
        {detail?.description && (
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {detail.description}
          </Text>
        )}
        {detail?.tableOfContents && (
          <Stack gap={4}>
            <Text size="sm" fw={700}>
              目次
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {detail.tableOfContents}
            </Text>
          </Stack>
        )}
        {state.status === "error" && (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              詳細情報を取得できませんでした
            </Text>
            <Text size="xs" c="red" style={{ wordBreak: "break-all" }}>
              {state.debugInfo}
            </Text>
          </Stack>
        )}
        <Group justify="flex-end">
          <Button onClick={handleSelect}>この本で選択</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
