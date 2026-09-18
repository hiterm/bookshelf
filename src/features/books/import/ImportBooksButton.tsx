import { Button } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export const ImportBooksButton = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => void navigate({ to: "/books/import" })}>
      一括インポート
    </Button>
  );
};
