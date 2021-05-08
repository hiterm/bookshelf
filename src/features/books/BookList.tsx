import MaterialTable, { Column } from '@material-table/core';
import MuiLink from '@material-ui/core/Link';

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { tableIcons } from '../material-table/tableIcons';
import { Book } from './schema';

// https://github.com/Microsoft/TypeScript/issues/4922
const notUndefined = <T extends {}>(x: T | undefined): x is T => {
  return x !== undefined;
};

const BookListContainer: React.FC = () => {
  const bookIds = useAppSelector((state) => state.books.ids);
  const bookEntities = useAppSelector((state) => state.books.entities);
  // TODO: reselectを使う
  const books = bookIds
    .map((id) => bookEntities[id])
    .filter(notUndefined)
    // workaround: https://github.com/mbrn/material-table/issues/1979
    .map((book) => ({ ...book }));
  return <BookListPresenter list={books} />;
};

const BookListPresenter: React.FC<{ list: Book[] }> = (props) => {
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
    { title: '著者', field: 'authors', cellStyle: { minWidth: '150px' } },
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
      defaultFilter: 'checked',
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

export const BookList: React.FC<{ list: Book[] }> = (props) => (
  <BookListContainer />
);
