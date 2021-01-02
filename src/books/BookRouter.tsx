import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { db } from '../Firebase';
import { BookDetailPage } from './BookDetailPage';
import { BookIndexPage } from './BookIndexPage';
import { BookImportPage } from './BookImportPage';
import { Book, firebaseDocToBook } from './schema';

export const BookRouter: React.FC<{}> = () => {
  const [books, setBooks] = useState([] as Book[]);
  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map(firebaseDocToBook);
      setBooks(list);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
