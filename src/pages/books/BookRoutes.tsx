import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { db } from '../../Firebase';
import { booksReplaceAll } from '../../features/books/booksSlice';
import { Book, firebaseDocToBook } from '../../features/books/schema';
import { useAppDispatch } from '../../hooks';
import { BookDetailPage } from './BookDetailPage';
import { BookImportPage } from './BookImportPage';
import { BookIndexPage } from './BookIndexPage';

export const BookRouter: React.FC<{}> = () => {
  const [books, setBooks] = useState([] as Book[]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log('subscribe');
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const books = querySnapshot.docs.map(firebaseDocToBook);
      dispatch(booksReplaceAll(books));
    });
    return () => {
      unsubscribe();
      console.log('unsubscribe');
    };
  });

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
