import { ThemeIcon } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";

export const ShowBoolean: React.FC<{ flag: boolean }> = ({ flag }) => {
  return flag
    ? (
      <ThemeIcon size="sm" color="green">
        <IconCheck />
      </ThemeIcon>
    )
    : (
      <ThemeIcon size="sm" color="gray">
        <IconX />
      </ThemeIcon>
    );
};
