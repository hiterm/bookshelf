import { Group, Paper } from "@mantine/core";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  mobileOnly?: boolean;
};

export const BookImportActionBar = ({
  children,
  mobileOnly = false,
}: Props) => (
  <>
    <Paper
      aria-hidden="true"
      h="calc(4.25rem + env(safe-area-inset-bottom))"
      hiddenFrom={mobileOnly ? "md" : undefined}
    />
    <Paper
      component="aside"
      aria-label="書籍インポート操作"
      hiddenFrom={mobileOnly ? "md" : undefined}
      withBorder
      shadow="sm"
      px="md"
      pt="xs"
      pb="calc(var(--mantine-spacing-xs) + env(safe-area-inset-bottom))"
      style={{
        position: "fixed",
        insetInlineStart:
          "calc(var(--app-shell-navbar-offset, 0rem) + var(--app-shell-padding, 0rem))",
        insetInlineEnd: "var(--app-shell-padding, 0rem)",
        bottom: 0,
        zIndex: 100,
      }}
    >
      <Group justify="space-between" gap="sm" wrap="nowrap">
        {children}
      </Group>
    </Paper>
  </>
);
