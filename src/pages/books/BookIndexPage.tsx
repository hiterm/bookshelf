import React, { useMemo } from 'react';
import { BookAddButton } from '../../features/books/BookAddButton';
import { BookList } from '../../features/books/BookList';
import { Book } from '../../features/books/schema';
import { useBooksQuery } from '../../generated/graphql';

const BookIndexPage: React.FC = (props) => {
  const context = useMemo(() => ({ additionalTypenames: ['Book'] }), []);
  const [result, _reexecuteQuery] = useBooksQuery({ context });
  const { data, fetching, error } = result;

  if (fetching || data == null) {
    return <>loading</>;
  }

  return (
    <React.Fragment>
      <h2>一覧</h2>
      <BookAddButton />
      {data.books.map((book) => (
        <>
          <div>{book.id}</div>
          <div>{book.title}</div>
          <div>{JSON.stringify(book.authors)}</div>
        </>
      ))}
      {/* <BookList list={data.books} /> */}
    </React.Fragment>
  );
};

export { BookIndexPage };
