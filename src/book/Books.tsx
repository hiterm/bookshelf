import React, { useState, useEffect } from 'react';
import { useHistory, Route, Switch, useRouteMatch } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { firebase, db } from '../Firebase';
import { BookIndex } from './BookIndex';
import { BookDetail } from './BookDetail';
import { ImportBooks } from './ImportBooks';
import { Book, firebaseDocToBook } from './schema';

export const Books: React.FC<{}> = () => {
  const [user, setUser] = useState(null as firebase.User | null);
  useEffect(() => {
    const unlisten = firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        setUser(user);
      }
    });
    return () => {
      unlisten();
    };
  }, []);

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

  const history = useHistory();
  const handleSignOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    firebase.auth().signOut();
    history.push('/signin');
  };

  const { path } = useRouteMatch();

  return (
    <React.Fragment>
      <div>user: {user?.displayName}</div>
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
      <Button variant="contained" onClick={handleSignOut}>
        Sign Out
      </Button>
    </React.Fragment>
  );
};
