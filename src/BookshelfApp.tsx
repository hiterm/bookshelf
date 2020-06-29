import React, { useState, useEffect } from 'react';
import { firebase, db } from './Firebase';
import { useHistory } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';

type Book = {
  id: string;
  title: string;
};

function isBook(obj: any): obj is Book {
  return typeof obj.id === 'string' && typeof obj.title === 'string';
}

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li key={book.id}>{book.title}</li>
    ))}
  </ul>
);

const AddBookForm: React.FC<{}> = (props) => {
  return (
    <Formik
      initialValues={{ title: '' }}
      onSubmit={(values, formikBag) => {
        return db.collection('books').add({
          title: values.title,
        });
      }}
    >
      <Form>
        <Field name="title" type="text" />
        <button type="submit">Add</button>
      </Form>
    </Formik>
  );
};

export const BookshelfApp: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);

  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
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

  const history = useHistory();
  const handleSignOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    firebase.auth().signOut();
    history.push('/signin');
  };

  return (
    <React.Fragment>
      <div>{`user: ${user ? user.displayName : 'dummy'}`}</div>
      <AddBookForm />
      <BookList list={list} />
      <button onClick={handleSignOut}>Sign Out</button>
    </React.Fragment>
  );
};
