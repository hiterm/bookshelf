import {
  Alert,
  Badge,
  Button,
  Checkbox,
  FileInput,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMemo, useRef, useState } from "react";
import { useImportBooks } from "../api/useImportBooks";
import { useAppError } from "../../../components/errors/AppErrorProvider";
import { usePreviewBookImport } from "../api/usePreviewBookImport";
import type {
  ImportBookInput,
  PreviewBookImportMutation,
} from "../../../generated/graphql-request";
import { filterImportedBooks } from "./filterImportedBooks";
import { parseKindleExport, type ImportedBook } from "./parseKindleExport";
import { toImportBookInput } from "./toImportBookInput";

type BookImportDialogProps = {
  opened: boolean;
  onClose: () => void;
};

type IndexedBook = {
  index: number;
  book: ImportedBook;
};

const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const BookImportDialog = ({
  opened,
  onClose,
}: BookImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [books, setBooks] = useState<ImportedBook[]>([]);
  const [purchasedOnOrAfter, setPurchasedOnOrAfter] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<
    PreviewBookImportMutation["previewBookImport"] | null
  >(null);
  const [previewedInputs, setPreviewedInputs] = useState<
    ImportBookInput[] | null
  >(null);
  const fileReadId = useRef(0);
  const previewLock = useRef(false);
  const importLock = useRef(false);
  const previewBookImportMutation = usePreviewBookImport();
  const importBooksMutation = useImportBooks();
  const { reportError } = useAppError();

  const indexedBooks = useMemo<IndexedBook[]>(
    () => books.map((book, index) => ({ index, book })),
    [books],
  );
  const visibleBooks = useMemo(() => {
    const filtered = new Set(filterImportedBooks(books, purchasedOnOrAfter));
    return indexedBooks.filter(({ book }) => filtered.has(book));
  }, [books, indexedBooks, purchasedOnOrAfter]);
  const selectedVisibleBooks = visibleBooks.filter(({ index }) =>
    selectedIndexes.has(index),
  );
  const selectedInputs = useMemo(
    () => selectedVisibleBooks.map(({ book }) => toImportBookInput(book)),
    [selectedVisibleBooks],
  );
  const busy =
    isReading ||
    isPreviewing ||
    isImporting ||
    previewBookImportMutation.isPending ||
    importBooksMutation.isPending;

  const invalidatePreview = () => {
    setPreview(null);
    setPreviewedInputs(null);
  };

  const reset = () => {
    fileReadId.current += 1;
    setFile(null);
    setBooks([]);
    setPurchasedOnOrAfter("");
    setSelectedIndexes(new Set());
    setParseError(null);
    setIsReading(false);
    setIsPreviewing(false);
    setIsImporting(false);
    setPreview(null);
    setPreviewedInputs(null);
    previewLock.current = false;
    importLock.current = false;
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const loadFile = async (nextFile: File | null) => {
    if (
      isPreviewing ||
      isImporting ||
      previewBookImportMutation.isPending ||
      importBooksMutation.isPending
    )
      return;
    const readId = fileReadId.current + 1;
    fileReadId.current = readId;
    invalidatePreview();
    setFile(nextFile);
    setParseError(null);
    if (nextFile == null) {
      setBooks([]);
      setSelectedIndexes(new Set());
      setIsReading(false);
      return;
    }

    setIsReading(true);
    try {
      const parsed = parseKindleExport(await nextFile.text());
      if (fileReadId.current !== readId) return;
      setBooks(parsed);
      setSelectedIndexes(new Set(parsed.map((_, index) => index)));
    } catch (error) {
      if (fileReadId.current !== readId) return;
      setBooks([]);
      setSelectedIndexes(new Set());
      setParseError(String(error instanceof Error ? error.message : error));
    } finally {
      if (fileReadId.current === readId) setIsReading(false);
    }
  };

  const toggleBook = (index: number, checked: boolean) => {
    if (busy) return;
    invalidatePreview();
    setSelectedIndexes((current) => {
      const next = new Set(current);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const runPreview = async () => {
    if (busy || previewLock.current || selectedInputs.length === 0) return;

    previewLock.current = true;
    setIsPreviewing(true);
    invalidatePreview();
    const inputs = selectedInputs;
    try {
      const result = await previewBookImportMutation.mutateAsync(inputs);
      setPreview(result.previewBookImport);
      setPreviewedInputs(inputs);
    } catch (error) {
      invalidatePreview();
      reportError({
        title: "書籍インポートのプレビューに失敗しました",
        operation: "PreviewBookImport",
        error,
      });
    } finally {
      previewLock.current = false;
      setIsPreviewing(false);
    }
  };

  const submit = async () => {
    if (busy || importLock.current || previewedInputs == null) return;

    importLock.current = true;
    setIsImporting(true);
    try {
      const result = await importBooksMutation.mutateAsync(previewedInputs);
      const importedCount = result.importBooks.books.length;
      showNotification({
        message: `${String(importedCount)}冊をインポートしました`,
        color: "teal",
      });
      reset();
      onClose();
    } catch (error) {
      reportError({
        title: "書籍のインポートに失敗しました",
        operation: "ImportBooks",
        error,
      });
    } finally {
      importLock.current = false;
      setIsImporting(false);
    }
  };

  return (
    <Modal
      title="書籍一括インポート"
      opened={opened}
      onClose={close}
      size="xl"
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
    >
      <Stack>
        <FileInput
          label="Kindle Bookshelf ExporterのJSONファイル"
          placeholder="kindle.jsonを選択"
          accept="application/json,.json"
          value={file}
          onChange={(nextFile) => void loadFile(nextFile)}
          disabled={busy}
          clearable
        />

        {parseError == null ? null : (
          <Alert color="red" title="ファイルを読み込めませんでした">
            {parseError}
          </Alert>
        )}

        {books.length === 0 ? null : (
          <>
            <TextInput
              type="date"
              label="購入日（指定日以降）"
              value={purchasedOnOrAfter}
              onChange={(event) => {
                invalidatePreview();
                setPurchasedOnOrAfter(event.target.value);
              }}
              disabled={busy}
            />

            <Group>
              <Text>全件数: {books.length}</Text>
              <Text>条件該当件数: {visibleBooks.length}</Text>
              <Text>選択件数: {selectedVisibleBooks.length}</Text>
            </Group>

            <Group>
              <Button
                variant="default"
                onClick={() => {
                  invalidatePreview();
                  setSelectedIndexes(
                    new Set(visibleBooks.map(({ index }) => index)),
                  );
                }}
                disabled={busy || visibleBooks.length === 0}
              >
                すべて選択
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  invalidatePreview();
                  setSelectedIndexes(new Set());
                }}
                disabled={busy || selectedIndexes.size === 0}
              >
                すべて解除
              </Button>
            </Group>

            {visibleBooks.length === 0 ? (
              <Text>条件に該当する書籍はありません</Text>
            ) : (
              <ScrollArea h={360}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>対象</Table.Th>
                      <Table.Th>タイトル</Table.Th>
                      <Table.Th>著者</Table.Th>
                      <Table.Th>購入日</Table.Th>
                      <Table.Th>読書状況</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visibleBooks.map(({ index, book }) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Checkbox
                            aria-label={`${book.title}をインポート`}
                            checked={selectedIndexes.has(index)}
                            onChange={(event) => {
                              toggleBook(index, event.currentTarget.checked);
                            }}
                            disabled={busy}
                          />
                        </Table.Td>
                        <Table.Td>{book.title}</Table.Td>
                        <Table.Td>{book.authorNames.join(", ")}</Table.Td>
                        <Table.Td>{formatDate(book.purchasedAt)}</Table.Td>
                        <Table.Td>{book.read ? "既読" : "未読"}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}

            {preview == null ? null : (
              <Stack gap="xs">
                <Text fw={700}>インポート内容</Text>
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
                        <Group key={author.name} gap={4}>
                          <Text size="sm">{author.name}</Text>
                          <Badge
                            size="sm"
                            color={
                              author.status === "EXISTING" ? "blue" : "green"
                            }
                          >
                            {author.status === "EXISTING" ? "既存" : "新規"}
                          </Badge>
                        </Group>
                      ))}
                    </Group>
                    <Text size="sm">
                      ISBN: {book.isbn === "" ? "なし" : book.isbn} /{" "}
                      {book.read ? "既読" : "未読"} /{" "}
                      {book.owned ? "所有" : "未所有"} / 優先度: {book.priority}{" "}
                      / {book.format} / {book.store}
                    </Text>
                  </Stack>
                ))}
                <Text>{preview.books.length}冊をインポートします</Text>
              </Stack>
            )}

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => void runPreview()}
                disabled={busy || selectedInputs.length === 0}
                loading={isPreviewing || previewBookImportMutation.isPending}
              >
                {preview == null ? "プレビュー" : "再プレビュー"}
              </Button>
              <Button
                onClick={() => void submit()}
                disabled={busy || previewedInputs == null}
                loading={isImporting || importBooksMutation.isPending}
              >
                インポート
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
};
