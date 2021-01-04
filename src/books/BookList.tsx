import MaterialTable, { Column } from 'material-table';
import React from 'react';
import { Book } from './schema';

export const BookList: React.FC<{ list: Book[] }> = (props) => {
  const columns: Column<Book>[] = [
    {
      title: '書名',
      field: 'title',
    },
    { title: '著者', field: 'authors' },
    {
      title: '形式',
      field: 'format',
    },
    {
      title: 'ストア',
      field: 'store',
    },
    { title: '優先度', field: 'priority' },
    {
      title: '既読',
      field: 'read',
    },
    {
      title: '所有',
      field: 'owned',
    },
    {
      title: '追加日時',
      field: 'createdAt',
      type: 'datetime',
    },
    {
      title: '更新日時',
      field: 'updatedAt',
      type: 'datetime',
    },
  ];

  return (
    <MaterialTable
      columns={columns}
      data={props.list}
      title=""
      options={{ filtering: true, columnsButton: true }}
    />
  );
};
