import {
  Alert,
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
import { useImportBooks } from "../../../compoments/hooks/useImportBooks";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileReadId = useRef(0);
  const submitLock = useRef(false);
  const importBooksMutation = useImportBooks();

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
  const busy = isReading || isSubmitting || importBooksMutation.isPending;

  const reset = () => {
    fileReadId.current += 1;
    setFile(null);
    setBooks([]);
    setPurchasedOnOrAfter("");
    setSelectedIndexes(new Set());
    setParseError(null);
    setIsReading(false);
    setIsSubmitting(false);
    submitLock.current = false;
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const loadFile = async (nextFile: File | null) => {
    const readId = fileReadId.current + 1;
    fileReadId.current = readId;
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
    setSelectedIndexes((current) => {
      const next = new Set(current);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const submit = async () => {
    if (busy || submitLock.current || selectedVisibleBooks.length === 0) return;

    submitLock.current = true;
    setIsSubmitting(true);
    try {
      const result = await importBooksMutation.mutateAsync(
        selectedVisibleBooks.map(({ book }) => toImportBookInput(book)),
      );
      const importedCount = result.importBooks.books.length;
      showNotification({
        message: `${String(importedCount)}冊をインポートしました`,
        color: "teal",
      });
      reset();
      onClose();
    } catch (error) {
      showNotification({
        message: `書籍のインポートに失敗しました: ${String(error)}`,
        color: "red",
      });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
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

            <Button
              onClick={() => void submit()}
              disabled={busy || selectedVisibleBooks.length === 0}
              loading={busy}
            >
              インポート
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
};
