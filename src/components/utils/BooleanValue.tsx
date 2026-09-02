import { ThemeIcon } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export const BooleanValue: React.FC<{ flag: boolean }> = ({ flag }) => {
  return flag ? (
    <ThemeIcon component="span" size="sm" color="green">
      <IconCheck />
    </ThemeIcon>
  ) : (
    <ThemeIcon component="span" size="sm" color="gray">
      <IconX />
    </ThemeIcon>
  );
};
