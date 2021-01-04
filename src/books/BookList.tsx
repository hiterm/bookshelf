import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';
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
    { title: '優先度', field: 'priority', defaultSort: 'desc' },
    {
      title: '既読',
      field: 'read',
      type: 'boolean',
      defaultFilter: 'unchecked',
    },
    {
      title: '所有',
      field: 'owned',
      type: 'boolean',
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

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const handleRowClick = (
    event?: React.MouseEvent<Element, MouseEvent>,
    rowData?: Book
  ) => {
    if (rowData === undefined) {
      enqueueSnackbar(`予期せぬエラー: rowDataがundefined`, {
        variant: 'error',
      });
      return;
    }
    history.push(`/books/${rowData.id}`);
  };

  return (
    <MaterialTable
      columns={columns}
      data={props.list}
      title=""
      onRowClick={handleRowClick}
      options={{
        filtering: true,
        columnsButton: true,
        pageSize: 20,
        pageSizeOptions: [20, 50, 100, 500, 1000],
      }}
    />
  );
};
