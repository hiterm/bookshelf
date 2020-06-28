import React, { useState, useEffect } from 'react';
import { firebase, db } from './Firebase';
import { SignInScreen } from './SignInScreen';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';

type Book = {
  title: string;
};

function isBook(obj: any): obj is Book {
  return obj.title !== undefined;
}

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li>{book.title}</li>
    ))}
  </ul>
);

const Form: React.FC<{}> = (props) => {
  const [formTitle, setFormTitle] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormTitle(event.target.value);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    db.collection('books').add({
      title: formTitle,
    });
  };

  return (
    <form>
      <label>
        Title:
        <input type="text" name="title" onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Add</button>
    </form>
  );
};

export const BookshelfApp: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);

  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map((doc) => doc.data());
      const filteredList = list
        .map((data) => {
          if (!isBook(data)) {
            console.log(`data is not "Book" object: ${data}`);
            return null;
          }
          return data;
        })
        .filter((data): data is Book => data !== null);
      setList(filteredList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [user, setUser] = useState(null as firebase.User | null);
  const history = useHistory();
  useEffect(() => {
    const unlisten = firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        setUser(user);
      } else {
        history.push('/signin');
      }
    });
    return () => {
      unlisten();
    };
  }, [history]);

  const handleSignOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    firebase.auth().signOut();
  };

  return (
    <Router>
      <Switch>
        <Route path="/signin">
          <SignInScreen />
        </Route>
        <Route path="/">
          <div>{`user: ${user ? user.displayName : 'dummy'}`}</div>
          <Form />
          <BookList list={list} />
          <button onClick={handleSignOut}>Sign Out</button>
        </Route>
      </Switch>
    </Router>
  );
};
