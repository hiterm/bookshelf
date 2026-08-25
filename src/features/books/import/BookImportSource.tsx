import {
  Alert,
  Button,
  FileInput,
  SegmentedControl,
  Stack,
  Textarea,
} from "@mantine/core";

export type ImportSourceMethod = "file" | "text";

type Props = {
  method: ImportSourceMethod;
  file: File | null;
  text: string;
  error: string | null;
  busy: boolean;
  onMethodChange: (method: ImportSourceMethod) => void;
  onFileChange: (file: File | null) => void;
  onTextChange: (text: string) => void;
  onLoadText: () => void;
};

export const BookImportSource = ({
  method,
  file,
  text,
  error,
  busy,
  onMethodChange,
  onFileChange,
  onTextChange,
  onLoadText,
}: Props) => (
  <Stack>
    <SegmentedControl
      aria-label="入力方法"
      value={method}
      onChange={(value) => {
        onMethodChange(value);
      }}
      data={[
        { label: "ファイル", value: "file" },
        { label: "テキスト", value: "text" },
      ]}
      disabled={busy}
    />
    {method === "file" ? (
      <FileInput
        label="Kindle Bookshelf ExporterのJSONファイル"
        placeholder="kindle.jsonを選択"
        accept="application/json,.json"
        value={file}
        onChange={onFileChange}
        disabled={busy}
        clearable
      />
    ) : (
      <>
        <Textarea
          label="Kindle Bookshelf ExporterのJSONテキスト"
          placeholder="JSONを貼り付け"
          minRows={7}
          value={text}
          onChange={(event) => {
            onTextChange(event.currentTarget.value);
          }}
          disabled={busy}
        />
        <Button
          variant="default"
          onClick={onLoadText}
          disabled={busy || text.trim() === ""}
        >
          テキストを読み込む
        </Button>
      </>
    )}
    {error == null ? null : (
      <Alert color="red" title="入力を読み込めませんでした">
        {error}
      </Alert>
    )}
  </Stack>
);
