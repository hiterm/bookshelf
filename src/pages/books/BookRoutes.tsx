import React, { useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Book } from '../../features/books/schema';
import { BookDetailPage } from './BookDetailPage';
import { BookImportPage } from './BookImportPage';
import { BookIndexPage } from './BookIndexPage';

export const BookRouter: React.FC<{}> = () => {
  const [books, _setBooks] = useState([] as Book[]);
  // TODO fetch from api

  const { path } = useRouteMatch();

  return (
    <React.Fragment>
      <div>
        <Switch>
          <Route exact path={path}>
            <BookIndexPage books={books} />
          </Route>
          <Route path={`${path}/import`}>
            <BookImportPage />
          </Route>
          <Route path={`${path}/:id`}>
            <BookDetailPage books={books} />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
};
