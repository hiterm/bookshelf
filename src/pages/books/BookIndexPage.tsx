import React, { useMemo } from 'react';
import { BookAddButton } from '../../features/books/BookAddButton';
import { BookList } from '../../features/books/BookList';
import { Book, graphQlBookToBook } from '../../features/books/schema';
import { useBooksQuery } from '../../generated/graphql';

const BookIndexPage: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ['Book'] }), []);
  const [result, _reexecuteQuery] = useBooksQuery({ context });
  const { data, fetching, error } = result;

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
    return <>loading</>;
  }

  const books: Book[] = data.books.map(graphQlBookToBook);

  return (
    <React.Fragment>
      <h2>一覧</h2>
      <BookAddButton />
      <BookList list={books} />
    </React.Fragment>
  );
};

export { BookIndexPage };
