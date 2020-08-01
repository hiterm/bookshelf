import React from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { BookDetailEdit } from './BookDetailEdit';
import { BookDetailShow } from './BookDetailShow';
import { Book } from './schema';

const BookDetail: React.FC<{ books: Book[] }> = (props) => {
  const { path } = useRouteMatch();
  const { id } = useParams();

  const book: Book | undefined = props.books.find((book) => book.id === id);

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

export { BookDetail };
