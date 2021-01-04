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
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: 'ストア',
      field: 'store',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    { title: '優先度', field: 'priority' },
    {
      title: '既読',
      field: 'read',
    },
    {
      title: '所有',
      field: 'owned',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: '追加日時',
      field: 'createdAt',
      type: 'datetime',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: '更新日時',
      field: 'updatedAt',
      type: 'datetime',
      hidden: true,
      hiddenByColumnsButton: true,
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
