import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Menu,
  Popover,
} from "@mantine/core";
import { IconLayoutColumns } from "@tabler/icons-react";
import React from "react";
import type { BookTable } from "./bookTable";

type BookTableToolbarProps = {
  table: BookTable;
  onApplyUnreadOwnedPreset: () => void;
  onReset: () => void;
};

export const BookTableToolbar: React.FC<BookTableToolbarProps> = ({
  table,
  onApplyUnreadOwnedPreset,
  onReset,
}) => (
  <Group>
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon variant="outline">
          <IconLayoutColumns />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Button
          onClick={() => {
            table.toggleAllColumnsVisible();
          }}
        >
          Toggle all
        </Button>
        <Box mt="md">
          {table.getAllLeafColumns().map((column) => {
            return (
              <Checkbox
                key={column.id}
                label={
                  typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id
                }
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
            );
          })}
        </Box>
      </Popover.Dropdown>
    </Popover>
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>Preset filters</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={onApplyUnreadOwnedPreset}>
          Unread owned, order by priority
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
    <Button onClick={onReset} color="red">
      Reset filter
    </Button>
  </Group>
);
