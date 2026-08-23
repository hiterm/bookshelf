const eventSetOperationLabels: Readonly<Record<string, string>> = {
  create_book: "書籍を追加",
  update_book: "書籍を更新",
  delete_book: "書籍を削除",
  create_author: "著者を追加",
  update_author: "著者を更新",
  delete_author: "著者を削除",
  merge_author: "著者を統合",
  import_books: "書籍をインポート",
  restore_book: "書籍を復元",
  restore_author: "著者を復元",
};

const eventOperationLabels: Readonly<Record<string, string>> = {
  create: "追加",
  update: "更新",
  delete: "削除",
  restore: "復元",
  CREATE: "追加",
  UPDATE: "更新",
  DELETE: "削除",
  RESTORE: "復元",
  MERGE_AS_DESTINATION: "統合先",
};

export const displayEventSetOperation = (operation: string): string =>
  eventSetOperationLabels[operation] ?? operation;

export const displayEventOperation = (operation: string): string =>
  eventOperationLabels[operation] ?? operation;
