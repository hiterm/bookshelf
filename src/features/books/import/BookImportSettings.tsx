import {
  Button,
  Checkbox,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { BOOK_FORMAT_VALUE, displayBookFormat } from "../entity/BookFormat";
import { BOOK_STORE_VALUE, displayBookStore } from "../entity/BookStore";
import type { BookImportDefaults } from "./toImportBookInput";

type Props = {
  settings: BookImportDefaults;
  total: number;
  visible: number;
  selected: number;
  busy: boolean;
  onChange: (settings: BookImportDefaults) => void;
  onPreview: () => void;
};

export const BookImportSettings = ({
  settings,
  total,
  visible,
  selected,
  busy,
  onChange,
  onPreview,
}: Props) => (
  <Stack
    p="md"
    bd="1px solid var(--mantine-color-gray-3)"
    style={{
      position: "sticky",
      top: "calc(var(--app-shell-header-height) + 1rem)",
    }}
  >
    <Text fw={700}>共通設定</Text>
    <Select
      label="ストア"
      value={settings.store}
      data={BOOK_STORE_VALUE.map((value) => ({
        value,
        label: displayBookStore(value),
      }))}
      onChange={(value) => {
        if (value != null) onChange({ ...settings, store: value });
      }}
      disabled={busy}
      allowDeselect={false}
    />
    <Select
      label="形式"
      value={settings.format}
      data={BOOK_FORMAT_VALUE.map((value) => ({
        value,
        label: displayBookFormat(value),
      }))}
      onChange={(value) => {
        if (value != null) onChange({ ...settings, format: value });
      }}
      disabled={busy}
      allowDeselect={false}
    />
    <Checkbox
      label="所有している"
      checked={settings.owned}
      onChange={(event) => {
        onChange({ ...settings, owned: event.currentTarget.checked });
      }}
      disabled={busy}
    />
    <NumberInput
      label="優先度"
      min={0}
      max={100}
      value={settings.priority}
      onChange={(value) => {
        if (typeof value === "number")
          onChange({ ...settings, priority: value });
      }}
      disabled={busy}
    />
    <Text>全件: {total}</Text>
    <Text>表示中: {visible}</Text>
    <Text>インポート対象: {selected}</Text>
    <Button
      onClick={onPreview}
      disabled={busy || selected === 0}
      loading={busy}
    >
      プレビュー
    </Button>
  </Stack>
);
