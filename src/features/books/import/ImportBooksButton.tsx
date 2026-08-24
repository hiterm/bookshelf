import { Button } from "@mantine/core";
import { useState } from "react";
import { BookImportDialog } from "./BookImportDialog";

export const ImportBooksButton = () => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setOpened(true);
        }}
      >
        一括インポート
      </Button>
      <BookImportDialog
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
      />
    </>
  );
};
