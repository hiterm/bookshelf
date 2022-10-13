import MaterialTable, { Column } from '@material-table/core';
import MuiLink from '@mui/material/Link';

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { tableIcons } from '../material-table/tableIcons';
import {
  BOOK_FORMAT_VALUE,
  BOOK_STORE_VALUE,
  Book,
  displayBookFormat,
  displayBookStore,
} from './schema';

export const BookList: React.FC<{ list: Book[] }> = (props) => {
  const columns: Column<Book>[] = [
    {
      title: '書名',
      field: 'title',
      cellStyle: { minWidth: '200px' },
      render: (rowData) => (
        <MuiLink component={RouterLink} to={`/books/${rowData.id}`}>
          {rowData.title}
        </MuiLink>
      ),
    },
    {
      title: '著者',
      field: 'authors',
      cellStyle: { minWidth: '150px' },
      render: (rowData) =>
        rowData.authors.map((author) => author.name).join(','),
      customFilterAndSearch: (term, rowData) =>
        rowData.authors.some((author) => author.name.includes(term)),
    },
    { title: 'ISBN', field: 'isbn', hidden: true },
    {
      title: '形式',
      field: 'format',
      hidden: true,
      lookup: Object.fromEntries(
        BOOK_FORMAT_VALUE.map((format) => [format, displayBookFormat(format)])
      ),
    },
    {
      title: 'ストア',
      field: 'store',
      hidden: true,
      lookup: Object.fromEntries(
        BOOK_STORE_VALUE.map((store) => [store, displayBookStore(store)])
      ),
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
      defaultFilter: 'checked',
    },
    {
      title: '追加日時',
      field: 'createdAt',
      type: 'datetime',
      hidden: true,
    },
    {
      title: '更新日時',
      field: 'updatedAt',
      type: 'datetime',
      hidden: true,
    },
  ];

  return (
    <MaterialTable
      columns={columns}
      data={props.list}
      title=""
      options={{
        filtering: true,
        columnsButton: true,
        pageSize: 20,
        pageSizeOptions: [20, 50, 100, 500, 1000],
      }}
      icons={tableIcons}
    />
  );
};
