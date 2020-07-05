import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Field, FieldArray, Form } from 'formik';
import Button from '@material-ui/core/Button';
import { firebase, db } from '../Firebase';
import { Book, bookFormSchema, firebaseDocToBook } from './schema';

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
        <tr key={book.id}>
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
                      <Button
                        variant="contained"
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        -
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="contained"
                    type="button"
                    onClick={() => arrayHelpers.push('')}
                  >
                    +
                  </Button>
                </div>
              )}
            />
          </div>
          {JSON.stringify(errors)}
          <Button variant="contained" color="primary" type="submit">
            Add
          </Button>
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
      <h2>追加</h2>
      <BookAddForm />
      <h2>一覧</h2>
      ソート：
      <Formik
        initialValues={{ sortBy: 'title' as keyof Book, order: 1 }}
        onSubmit={(values) => {
          const compareBy = (sortBy: keyof Book) => (a: Book, b: Book) => {
            if (a[sortBy] < b[sortBy]) {
              return -1 * values.order;
            } else if (a[sortBy] > b[sortBy]) {
              return 1 * values.order;
            } else {
              return 0;
            }
          };
          const sorted = list.slice().sort(compareBy(values.sortBy));
          setList(sorted);
        }}
      >
        <Form>
          <Field name="sortBy" as="select">
            <option value="title">題名</option>
            <option value="authors">著者</option>
            <option value="priority">優先度</option>
          </Field>
          <Field name="order" as="select">
            <option value="1">昇順</option>
            <option value="-1">降順</option>
          </Field>
          <Button variant="contained" type="submit">
            反映
          </Button>
        </Form>
      </Formik>
      <BookList list={list} />
    </React.Fragment>
  );
};

export { BookIndex };
