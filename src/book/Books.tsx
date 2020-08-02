import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { db } from '../Firebase';
import { BookDetail } from './BookDetail';
import { BookIndex } from './BookIndex';
import { ImportBooks } from './ImportBooks';
import { Book, firebaseDocToBook } from './schema';

export const Books: React.FC<{}> = () => {
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
            <BookIndex books={books} />
          </Route>
          <Route path={`${path}/import`}>
            <ImportBooks />
          </Route>
          <Route path={`${path}/:id`}>
            <BookDetail books={books} />
          </Route>
        </Switch>
      </div>
    </React.Fragment>
  );
};
