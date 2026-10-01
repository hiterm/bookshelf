import { Alert } from "@mantine/core";
import { normalizeError } from "./appError";

export const LocalError = ({
  error,
  title,
}: {
  error: unknown;
  title: string;
}): React.JSX.Element => (
  <Alert
    color="red"
    title={title}
    role="alert"
    style={{ overflowWrap: "anywhere" }}
  >
    {normalizeError(error).message}
  </Alert>
);
