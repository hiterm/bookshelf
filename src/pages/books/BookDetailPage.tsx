import React from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { BookDetailEdit } from '../../features/books/BookDetailEdit';
import { BookDetailShow } from '../../features/books/BookDetailShow';
import { OldBook } from '../../features/books/schema';

const BookDetailPage: React.FC<{ books: OldBook[] }> = (props) => {
  const { path } = useRouteMatch();
  const { id } = useParams<{ id: string }>();

  const book: OldBook | undefined = props.books.find((book) => book.id === id);

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  return (
    <React.Fragment>
      <Switch>
        <Route exact path={path}>
          <BookDetailShow book={book} />
        </Route>
        <Route path={`${path}/edit`}>
          <BookDetailEdit book={book} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export { BookDetailPage };
