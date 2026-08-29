import { Button, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useAppError } from "../../../components/errors/AppErrorProvider";
import type {
  ImportBookInput,
  PreviewBookImportMutation,
} from "../../../generated/graphql-request";
import { useImportBooks } from "../api/useImportBooks";
import { usePreviewBookImport } from "../api/usePreviewBookImport";
import { BookImportPreview } from "./BookImportPreview";
import { BookImportActionBar } from "./BookImportActionBar";
import { BookImportSettings } from "./BookImportSettings";
import { BookImportSource, type ImportSourceMethod } from "./BookImportSource";
import { BookImportTable, type IndexedImportedBook } from "./BookImportTable";
import { filterImportedBooks } from "./filterImportedBooks";
import { updateVisibleSelection } from "./importSelection";
import { parseKindleExport, type ImportedBook } from "./parseKindleExport";
import {
  KINDLE_BOOK_IMPORT_DEFAULTS,
  toImportBookInput,
  type BookImportDefaults,
} from "./toImportBookInput";
import classes from "./BookImportPage.module.css";

export const BookImportPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<ImportSourceMethod>("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [books, setBooks] = useState<ImportedBook[]>([]);
  const [purchasedOnOrAfter, setPurchasedOnOrAfter] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [splitAuthors, setSplitAuthors] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<BookImportDefaults>({
    ...KINDLE_BOOK_IMPORT_DEFAULTS,
  });
  const [parseError, setParseError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [preview, setPreview] = useState<
    PreviewBookImportMutation["previewBookImport"] | null
  >(null);
  const [previewedInputs, setPreviewedInputs] = useState<
    ImportBookInput[] | null
  >(null);
  const fileReadId = useRef(0);
  const previewLock = useRef(false);
  const importLock = useRef(false);
  const previewMutation = usePreviewBookImport();
  const importMutation = useImportBooks();
  const { reportError } = useAppError();

  const indexedBooks = useMemo<IndexedImportedBook[]>(
    () => books.map((book, index) => ({ book, index })),
    [books],
  );
  const visibleBooks = useMemo(() => {
    const visible = new Set(filterImportedBooks(books, purchasedOnOrAfter));
    return indexedBooks.filter(({ book }) => visible.has(book));
  }, [books, indexedBooks, purchasedOnOrAfter]);
  const importTargets = visibleBooks.filter(({ index }) =>
    selectedIndexes.has(index),
  );
  const busy =
    isReading || previewMutation.isPending || importMutation.isPending;

  const invalidatePreview = () => {
    setPreview(null);
    setPreviewedInputs(null);
  };

  const installSource = (source: string) => {
    const parsed = parseKindleExport(source);
    setBooks(parsed);
    setSelectedIndexes(new Set(parsed.map((_, index) => index)));
    setSplitAuthors(new Set());
    setParseError(null);
    invalidatePreview();
  };

  const loadFile = async (nextFile: File | null) => {
    if (previewMutation.isPending || importMutation.isPending) return;
    const readId = fileReadId.current + 1;
    fileReadId.current = readId;
    setFile(nextFile);
    setParseError(null);
    if (nextFile == null) return;
    setIsReading(true);
    try {
      const source = await nextFile.text();
      if (fileReadId.current !== readId) return;
      installSource(source);
    } catch (error) {
      if (fileReadId.current !== readId) return;
      setParseError(error instanceof Error ? error.message : String(error));
    } finally {
      if (fileReadId.current === readId) setIsReading(false);
    }
  };

  const loadText = () => {
    if (busy) return;
    fileReadId.current += 1;
    try {
      installSource(text);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : String(error));
    }
  };

  const runPreview = async () => {
    if (busy || previewLock.current || importTargets.length === 0) return;
    previewLock.current = true;
    invalidatePreview();
    const inputs = importTargets.map(({ book, index }) =>
      toImportBookInput(
        book,
        { splitAuthorsByComma: splitAuthors.has(index) },
        settings,
      ),
    );
    try {
      const result = await previewMutation.mutateAsync(inputs);
      setPreview(result.previewBookImport);
      setPreviewedInputs(inputs);
    } catch (error) {
      reportError({
        title: "書籍インポートのプレビューに失敗しました",
        operation: "PreviewBookImport",
        error,
      });
    } finally {
      previewLock.current = false;
    }
  };

  const runImport = async () => {
    if (busy || importLock.current || previewedInputs == null) return;
    importLock.current = true;
    try {
      const result = await importMutation.mutateAsync(previewedInputs);
      showNotification({
        message: `${String(result.importBooks.books.length)}冊をインポートしました`,
        color: "teal",
      });
      await navigate({ to: "/books" });
    } catch (error) {
      reportError({
        title: "書籍のインポートに失敗しました",
        operation: "ImportBooks",
        error,
      });
    } finally {
      importLock.current = false;
    }
  };

  if (preview != null && previewedInputs != null) {
    return (
      <BookImportPreview
        preview={preview}
        importing={busy}
        onBack={() => {
          setPreview(null);
        }}
        onImport={() => void runImport()}
      />
    );
  }

  return (
    <Stack>
      <Title order={1}>書籍一括インポート</Title>
      <div className={classes.editor}>
        <div className={classes.source}>
          <BookImportSource
            method={method}
            file={file}
            text={text}
            error={parseError}
            busy={busy}
            onMethodChange={setMethod}
            onFileChange={(nextFile) => void loadFile(nextFile)}
            onTextChange={setText}
            onLoadText={loadText}
          />
        </div>
        <div className={classes.settings}>
          <BookImportSettings
            settings={settings}
            total={books.length}
            visible={visibleBooks.length}
            selected={importTargets.length}
            busy={busy}
            onChange={(next) => {
              invalidatePreview();
              setSettings(next);
            }}
            onPreview={() => void runPreview()}
          />
        </div>
        {books.length === 0 ? null : (
          <div className={classes.books}>
            <BookImportTable
              books={visibleBooks}
              purchasedOnOrAfter={purchasedOnOrAfter}
              selectedIndexes={selectedIndexes}
              splitAuthors={splitAuthors}
              busy={busy}
              onDateChange={(date) => {
                invalidatePreview();
                setPurchasedOnOrAfter(date);
              }}
              onSelectionChange={(index, selected) => {
                invalidatePreview();
                setSelectedIndexes((current) =>
                  updateVisibleSelection(current, [index], selected),
                );
              }}
              onSplitChange={(index, split) => {
                invalidatePreview();
                setSplitAuthors((current) =>
                  updateVisibleSelection(current, [index], split),
                );
              }}
              onSelectVisible={(selected) => {
                invalidatePreview();
                setSelectedIndexes((current) =>
                  updateVisibleSelection(
                    current,
                    visibleBooks.map(({ index }) => index),
                    selected,
                  ),
                );
              }}
              onSplitVisible={(split) => {
                invalidatePreview();
                setSplitAuthors((current) =>
                  updateVisibleSelection(
                    current,
                    visibleBooks.map(({ index }) => index),
                    split,
                  ),
                );
              }}
            />
          </div>
        )}
      </div>
      <BookImportActionBar mobileOnly>
        <Text fw={600}>対象 {importTargets.length}冊</Text>
        <Button
          aria-label="プレビュー（モバイル固定）"
          onClick={() => void runPreview()}
          disabled={busy || importTargets.length === 0}
          loading={busy}
        >
          プレビュー
        </Button>
      </BookImportActionBar>
    </Stack>
  );
};
