import { useAuth0 } from "@auth0/auth0-react";
import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { useAppError } from "../../components/errors/AppErrorProvider";
import { downloadBackup, type BackupScope } from "./backupDownload";

export const BackupPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { reportError } = useAppError();
  const [pending, setPending] = useState<Record<BackupScope, boolean>>({
    snapshot: false,
    full: false,
  });

  const runExport = async (scope: BackupScope) => {
    if (pending[scope]) return;
    setPending((current) => ({ ...current, [scope]: true }));
    try {
      await downloadBackup(scope, getAccessTokenSilently);
    } catch (error) {
      reportError({
        title: "バックアップのエクスポートに失敗しました",
        operation: scope === "snapshot" ? "Snapshot backup" : "Full backup",
        error,
      });
    } finally {
      setPending((current) => ({ ...current, [scope]: false }));
    }
  };

  return (
    <Stack gap="lg">
      <Title>バックアップ</Title>
      <Paper withBorder p="lg">
        <Stack align="flex-start">
          <Title order={2}>スナップショット</Title>
          <Text>
            本と著者の現在の状態を保存します。変更履歴は含まれません。
          </Text>
          <Button
            loading={pending.snapshot}
            disabled={pending.snapshot}
            onClick={() => void runExport("snapshot")}
          >
            スナップショットをエクスポート
          </Button>
        </Stack>
      </Paper>
      <Paper withBorder p="lg">
        <Stack align="flex-start">
          <Title order={2}>完全バックアップ</Title>
          <Text>現在の状態とすべての変更履歴を保存します。</Text>
          <Button
            loading={pending.full}
            disabled={pending.full}
            onClick={() => void runExport("full")}
          >
            完全バックアップをエクスポート
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
