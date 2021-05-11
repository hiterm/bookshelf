import MaterialTable, { Column } from '@material-table/core';
import MuiLink from '@material-ui/core/Link';
import { createSelector } from '@reduxjs/toolkit';

import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { db } from '../../Firebase';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { tableIcons } from '../material-table/tableIcons';
import { booksReplaceAll } from './booksSlice';
import { Book, firebaseDocToBook } from './schema';

// https://github.com/Microsoft/TypeScript/issues/4922
const notUndefined = <T extends {}>(x: T | undefined): x is T => {
  return x !== undefined;
};

interface BookListPresenterProps extends Book {
  createdAtDate: Date;
  updatedAtDate: Date;
}

const BookListContainer: React.FC = () => {
  const bookLoading = useAppSelector((state) => state.books.loading);

  const booksSelector = createSelector(
    [
      (state: RootState) => state.books.ids,
      (state: RootState) => state.books.entities,
    ],
    (bookIds, bookEntities) =>
      bookIds
        .map((id) => bookEntities[id])
        .filter(notUndefined)
        // workaround: https://github.com/mbrn/material-table/issues/1979
        .map((book) => ({
          ...book,
          createdAtDate: new Date(book.createdAt),
          updatedAtDate: new Date(book.updatedAt),
        }))
  );
  const books = useAppSelector(booksSelector);

  return <BookListPresenter list={books} />;
};

const BookListPresenter: React.FC<{ list: BookListPresenterProps[] }> = (
  props
) => {
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
      field: 'createdAtDate',
      type: 'datetime',
      hidden: true,
      hiddenByColumnsButton: true,
    },
    {
      title: '更新日時',
      field: 'updatedAtDate',
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

export const BookList: React.FC = () => <BookListContainer />;
