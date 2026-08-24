import {
  Alert,
  Button,
  Code,
  Collapse,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { formatErrorForClipboard, type AppError } from "./appError";
import { useAppError } from "./AppErrorProvider";

const ErrorEntry = ({ error }: { error: AppError }) => {
  const { dismissError } = useAppError();
  const [expanded, setExpanded] = useState(false);

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(formatErrorForClipboard(error));
      showNotification({
        message: "エラー詳細をコピーしました",
        color: "teal",
      });
    } catch {
      showNotification({
        message: "エラー詳細をコピーできませんでした",
        color: "red",
      });
    }
  };

  return (
    <Alert color="red" title={error.title} role="alert">
      <Stack gap="xs">
        <Text size="sm">{error.occurredAt.toLocaleString()}</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            aria-expanded={expanded}
            onClick={() => {
              setExpanded((current) => !current);
            }}
          >
            {expanded ? "詳細を隠す" : "詳細を表示"}
          </Button>
          <Button size="xs" variant="light" onClick={() => void copyDetails()}>
            詳細をコピー
          </Button>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => {
              dismissError(error.id);
            }}
          >
            閉じる
          </Button>
        </Group>
        <Collapse expanded={expanded}>
          <Code
            block
            style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {[
              ...(error.operation == null
                ? []
                : [`Operation: ${error.operation}`]),
              `Message: ${error.message}`,
              ...(error.details == null ? [] : [`Details:\n${error.details}`]),
            ].join("\n")}
          </Code>
        </Collapse>
      </Stack>
    </Alert>
  );
};

export const ErrorPanel = () => {
  const { errors, dismissAllErrors } = useAppError();
  if (errors.length === 0) return null;

  return (
    <Stack mb="md" data-testid="persistent-error-panel">
      {errors.length > 1 ? (
        <Group justify="flex-end">
          <Button
            size="xs"
            color="red"
            variant="subtle"
            onClick={dismissAllErrors}
          >
            すべて閉じる
          </Button>
        </Group>
      ) : null}
      {errors.map((error) => (
        <ErrorEntry key={error.id} error={error} />
      ))}
    </Stack>
  );
};
