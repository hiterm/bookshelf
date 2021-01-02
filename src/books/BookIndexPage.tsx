/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BookAddButton } from './BookAddButton';
import { BookList } from './BookList';
import { Book } from './schema';

const BookIndexPage: React.FC<{ books: Book[] }> = (props) => {
  return (
    <React.Fragment>
      <h2>一覧</h2>
      <BookAddButton />
      <BookList list={props.books} />
    </React.Fragment>
  );
};

export { BookIndexPage };
