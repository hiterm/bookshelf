import {
  Button,
  Checkbox,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import type { ImportedBook } from "./parseKindleExport";
import { toAuthorNames } from "./toImportBookInput";

export type IndexedImportedBook = { index: number; book: ImportedBook };

type Props = {
  books: readonly IndexedImportedBook[];
  purchasedOnOrAfter: string;
  selectedIndexes: ReadonlySet<number>;
  splitAuthors: ReadonlySet<number>;
  busy: boolean;
  onDateChange: (date: string) => void;
  onSelectionChange: (index: number, selected: boolean) => void;
  onSplitChange: (index: number, split: boolean) => void;
  onSelectVisible: (selected: boolean) => void;
};

const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const BookImportTable = ({
  books,
  purchasedOnOrAfter,
  selectedIndexes,
  splitAuthors,
  busy,
  onDateChange,
  onSelectionChange,
  onSplitChange,
  onSelectVisible,
}: Props) => (
  <Stack>
    <TextInput
      type="date"
      label="購入日（指定日以降）"
      value={purchasedOnOrAfter}
      onChange={(event) => {
        onDateChange(event.currentTarget.value);
      }}
      disabled={busy}
    />
    <Group>
      <Button
        variant="default"
        onClick={() => {
          onSelectVisible(true);
        }}
        disabled={busy || books.length === 0}
      >
        表示中をすべて選択
      </Button>
      <Button
        variant="default"
        onClick={() => {
          onSelectVisible(false);
        }}
        disabled={busy || books.length === 0}
      >
        表示中をすべて解除
      </Button>
    </Group>
    {books.length === 0 ? (
      <Text>条件に該当する書籍はありません</Text>
    ) : (
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>対象</Table.Th>
            <Table.Th>書籍</Table.Th>
            <Table.Th>著者</Table.Th>
            <Table.Th>購入日</Table.Th>
            <Table.Th>読書状況</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {books.map(({ index, book }) => {
            const split = splitAuthors.has(index);
            return (
              <Table.Tr key={`${book.asin}-${String(index)}`}>
                <Table.Td>
                  <Checkbox
                    aria-label={`${book.title}をインポート`}
                    checked={selectedIndexes.has(index)}
                    onChange={(event) => {
                      onSelectionChange(index, event.currentTarget.checked);
                    }}
                    disabled={busy}
                  />
                </Table.Td>
                <Table.Td>{book.title}</Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text>
                      {toAuthorNames(book.authorText, split).join(" / ")}
                    </Text>
                    <Checkbox
                      label="カンマで分割"
                      aria-label={`${book.title}の著者をカンマで分割`}
                      checked={split}
                      onChange={(event) => {
                        onSplitChange(index, event.currentTarget.checked);
                      }}
                      disabled={busy}
                    />
                  </Stack>
                </Table.Td>
                <Table.Td>{formatDate(book.purchasedAt)}</Table.Td>
                <Table.Td>{book.read ? "既読" : "未読"}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    )}
  </Stack>
);
