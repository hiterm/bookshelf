import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {
  DataGrid,
  booleanFilterFn,
  dateFilterFn,
  stringFilterFn,
} from 'mantine-data-grid';

import React from 'react';
import { Book, displayBookFormat, displayBookStore } from './schema';

const columnHelper = createColumnHelper<Book>();

// TODO: リンクをつける
// TODO: ストアと形式のフィルタ
const columns: ColumnDef<Book>[] = [
  { accessorKey: 'title', header: '書名', filterFn: stringFilterFn },
  columnHelper.accessor('authors', {
    header: '著者',
    cell: (info) =>
      info
        .getValue()
        .map((author) => author.name)
        .join(', '),
  }),
  { accessorKey: 'isbn', header: 'ISBN', filterFn: stringFilterFn },
  columnHelper.accessor('format', {
    header: '形式',
    cell: (info) => displayBookFormat(info.getValue()),
  }),
  columnHelper.accessor('store', {
    header: 'ストア',
    cell: (info) => displayBookStore(info.getValue()),
  }),
  { accessorKey: 'priority', header: '優先度', filterFn: stringFilterFn },
  { accessorKey: 'read', header: '既読', filterFn: booleanFilterFn },
  { accessorKey: 'owned', header: '所有', filterFn: booleanFilterFn },
  { accessorKey: 'createdAt', header: '追加日時', filterFn: dateFilterFn },
  { accessorKey: 'updatedAt', header: '更新日時', filterFn: dateFilterFn },
] as ColumnDef<Book>[];

export const BookList: React.FC<{ list: Book[] }> = (props) => {
  return (
    <DataGrid
      columns={columns}
      data={props.list}
      highlightOnHover
      withGlobalFilter
      withPagination
      withColumnFilters
      withSorting
    />
  );
};
