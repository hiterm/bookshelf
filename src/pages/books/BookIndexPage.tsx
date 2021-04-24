import React from 'react';
import { BookAddButton } from '../../books/BookAddButton';
import { BookList } from '../../books/BookList';
import { Book } from '../../books/schema';

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
