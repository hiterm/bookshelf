import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import Button from '@material-ui/core/Button';
import { db } from '../Firebase';
import { Book, firebaseDocToBook } from './schema';

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
          <Button variant="contained" color="primary" type="submit">
            更新
          </Button>
        </Form>
      </Formik>
    </React.Fragment>
  );
};

export { BookDetail };
