const operationTypeLabels: Record<string, string> = {
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

export const displayOperationType = (type: string): string =>
  operationTypeLabels[type] ?? type;
