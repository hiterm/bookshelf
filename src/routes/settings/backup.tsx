import { createFileRoute } from "@tanstack/react-router";
import { BackupPage } from "../../features/backup/BackupPage";

export const Route = createFileRoute("/settings/backup")({
  component: BackupPage,
});
