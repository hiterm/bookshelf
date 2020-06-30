import React, { useState, useEffect } from 'react';
import { firebase, db } from './Firebase';
import { useHistory } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';

const bookSchema = yup
  .object({
    id: yup.string().required(),
    title: yup.string().required(),
    authors: yup.array().of(yup.string().required()).required().default([]),
    isbn: yup.string().notRequired(),
    read: yup.boolean().notRequired(),
    priority: yup.number().notRequired(),
    createdAt: yup
      .date()
      .required()
      .default(() => Date.now()),
    updatedAt: yup
      .date()
      .required()
      .default(() => Date.now()),
  })
  .defined();

type Book = yup.InferType<typeof bookSchema>;

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li key={book.id}>
        {book.title}, {book.authors.join(', ')}
      </li>
    ))}
  </ul>
);

const AddBookForm: React.FC<{}> = () => {
  const handleSubmit = (values: any) => {
    return db.collection('books').add({
      title: values.title,
      authors: values.authors.split(','),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  return (
    <Formik initialValues={{ title: '', authors: '' }} onSubmit={handleSubmit}>
      <Form>
        <div>
          書名: <Field name="title" type="text" />
        </div>
        <div>
          著者: <Field name="authors" type="text" />
        </div>
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
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        };
      });
      const castedList = list.map((data) => bookSchema.cast(data));
      // debug
      castedList.forEach((book) => console.log(JSON.stringify(book)));
      setList(castedList);
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
