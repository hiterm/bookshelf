import {
  Button,
  Group,
  Image,
  Loader,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import { BookDetailModal } from "./BookDetailModal";
import {
  BookSearchBackend,
  BookSearchResult,
  useBookSearch,
} from "./useBookSearch";

type BookSearchDialogProps = {
  opened: boolean;
  onClose: () => void;
  onSelect: (result: BookSearchResult) => void;
};

export const BookSearchDialog = ({
  opened,
  onClose,
  onSelect,
}: BookSearchDialogProps) => {
  const [backend, setBackend] = useState<BookSearchBackend>("googleBooks");
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [detailResult, setDetailResult] = useState<BookSearchResult | null>(
    null,
  );
  const { state, search } = useBookSearch();

  const isAllEmpty = !title && !authorName && !publisher && !isbn;

  const handleSearch = () => {
    void search({ title, authorName, publisher, isbn }, backend);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="書籍を検索">
      <Stack>
        <SegmentedControl
          value={backend}
          onChange={(v) => {
            if (v === "googleBooks" || v === "ndl") {
              setBackend(v);
            }
          }}
          data={[
            { value: "googleBooks", label: "Google Books" },
            { value: "ndl", label: "NDL（国立国会図書館）" },
          ]}
        />
        <TextInput
          label="書名"
          value={title}
          onChange={(e) => {
            setTitle(e.currentTarget.value);
          }}
        />
        <TextInput
          label="著者名"
          value={authorName}
          onChange={(e) => {
            setAuthorName(e.currentTarget.value);
          }}
        />
        <TextInput
          label="出版社"
          value={publisher}
          onChange={(e) => {
            setPublisher(e.currentTarget.value);
          }}
        />
        <TextInput
          label="ISBN"
          value={isbn}
          onChange={(e) => {
            setIsbn(e.currentTarget.value);
          }}
        />
        <Button onClick={handleSearch} disabled={isAllEmpty}>
          検索
        </Button>
        {state.status === "loading" && <Loader />}
        {state.status === "error" && <Text c="red">{state.message}</Text>}
        {state.status === "success" && state.results.length === 0 && (
          <Text>見つかりませんでした</Text>
        )}
        {state.status === "success" && state.results.length > 0 && (
          <Stack style={{ maxHeight: 400, overflowY: "auto" }}>
            {state.results.map((result, index) => (
              <UnstyledButton
                key={index}
                onClick={() => {
                  onSelect(result);
                  onClose();
                }}
              >
                <Paper p="xs" withBorder>
                  <Group align="flex-start" wrap="nowrap">
                    {result.coverImageUrl && (
                      <Image
                        src={result.coverImageUrl}
                        w={50}
                        h={70}
                        fit="contain"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} lineClamp={2}>
                        {result.title}
                      </Text>
                      {result.subtitle && (
                        <Text size="sm" lineClamp={1}>
                          {result.subtitle}
                        </Text>
                      )}
                      <Text size="sm">{result.authorNames.join("、")}</Text>
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                          {[result.publisher, result.publishedDate, result.isbn]
                            .filter(Boolean)
                            .join("  ")}
                        </Text>
                        <Button
                          variant="subtle"
                          size="xs"
                          disabled={!result.isbn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailResult(result);
                          }}
                        >
                          詳細
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Paper>
              </UnstyledButton>
            ))}
          </Stack>
        )}
      </Stack>
      {detailResult && (
        <BookDetailModal
          opened
          onClose={() => {
            setDetailResult(null);
          }}
          searchResult={detailResult}
          onSelect={(result) => {
            onSelect(result);
            setDetailResult(null);
            onClose();
          }}
        />
      )}
    </Modal>
  );
};
