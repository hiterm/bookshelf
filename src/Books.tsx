import React, { useState, useEffect } from 'react';
import { firebase, db } from './Firebase';
import {
  useHistory,
  Route,
  Switch,
  Link,
  useRouteMatch,
  useParams,
} from 'react-router-dom';
import { Formik, Field, FieldArray, Form } from 'formik';
import { Book, bookFormSchema, bookSchema } from './schema';

const firebaseDocToBook = (doc: firebase.firestore.DocumentData) => {
  return bookSchema.cast({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  });
};

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <table>
    <thead>
      <tr>
        <th>題名</th>
        <th>著者</th>
        <th>優先度</th>
      </tr>
    </thead>
    <tbody>
      {props.list.map((book) => (
        <tr>
          <td>
            <Link to={`/books/${book.id}`}>{book.title}</Link>
          </td>
          <td>{book.authors.join(', ')}</td>
          <td>{book.priority}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BookDetail: React.FC<{}> = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null as Book | null);

  useEffect(() => {
    db.collection('books')
      .doc(id)
      .get()
      .then((doc) => {
        if (doc === undefined) {
          setBook(null);
        } else {
          setBook(firebaseDocToBook(doc));
        }
      });
  });

  return (
    <React.Fragment>
      <div>書名: {book?.title}</div>
      <div>著者：{book?.authors.join(', ')}</div>
      <div>優先度：{book?.priority}</div>
      <Formik
        initialValues={{ priority: 50 }}
        onSubmit={(values) => {
          let docRef = db.collection('books').doc(book?.id);
          docRef.update({
            priority: values.priority,
          });
        }}
      >
        <Form>
          <Field name="priority" type="number" />
          <button type="submit">更新</button>
        </Form>
      </Formik>
    </React.Fragment>
  );
};

const BookAddForm: React.FC<{}> = () => {
  const handleSubmit = (values: any) => {
    return db.collection('books').add({
      title: values.title,
      authors: values.authors,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  return (
    <Formik
      initialValues={{ title: '', authors: [''] }}
      validationSchema={bookFormSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors }) => (
        <Form>
          <div>
            書名: <Field name="title" type="text" />
          </div>
          <div>
            著者:
            <FieldArray
              name="authors"
              render={(arrayHelpers) => (
                <div>
                  {values.authors.map((_author: string, index: number) => (
                    <div key={index}>
                      <Field name={`authors.${index}`} />
                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => arrayHelpers.push('')}>
                    +
                  </button>
                </div>
              )}
            />
          </div>
          {JSON.stringify(errors)}
          <button type="submit">Add</button>
        </Form>
      )}
    </Formik>
  );
};

const BookIndex: React.FC<{}> = () => {
  const [list, setList] = useState([] as Book[]);

  useEffect(() => {
    const unsubscribe = db.collection('books').onSnapshot((querySnapshot) => {
      const list = querySnapshot.docs.map(firebaseDocToBook);
      // debug
      // castedList.forEach((book) => console.log(JSON.stringify(book)));
      setList(list);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <BookAddForm />
      <BookList list={list} />
    </React.Fragment>
  );
};

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

  const history = useHistory();
  const handleSignOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    firebase.auth().signOut();
    history.push('/signin');
  };

  const { path } = useRouteMatch();

  return (
    <React.Fragment>
      <Switch>
        <Route exact path={path}>
          <BookIndex />
        </Route>
        <Route path={`${path}/:id`}>
          <BookDetail />
        </Route>
      </Switch>
      <button onClick={handleSignOut}>Sign Out</button>
    </React.Fragment>
  );
};
