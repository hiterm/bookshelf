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
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  };
}

const BookList: React.FC<{ list: Book[] }> = (props) => (
  <ul>
    {props.list.map((book) => (
      <li key={book.id}>
        <Link to={`/books/${book.id}`}>
          題名：{book.title}, 著者：{book.authors.join(', ')}
        </Link>
      </li>
    ))}
  </ul>
);

const BookDetail: React.FC<{}> = () => {
  const { id } = useParams();
  const [bookData, setBookData] = useState(null as Book | null);

  useEffect(() => {
    db.collection('books')
      .doc(id)
      .get()
      .then((doc) => {
        if (doc === undefined) {
          setBookData(null);
        } else {
          setBookData(firebaseDocToBook(doc));
        }
      });
  });

  return <div>Title: {bookData?.title}</div>;
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
      const castedList = list.map((data) => bookSchema.cast(data));
      // debug
      // castedList.forEach((book) => console.log(JSON.stringify(book)));
      setList(castedList);
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
  )
}

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
