import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import Button from '@material-ui/core/Button';
import { db } from '../Firebase';
import { Book, firebaseDocToBook } from './schema';
import { TextField } from 'formik-material-ui';

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

  if (book === null) {
    return <div>Loading or not found.</div>;
  }

  return (
    <React.Fragment>
      <Formik
        initialValues={book}
        /* validationSchema={bookSchema} */
        onSubmit={(values) => {
          let docRef = db.collection('books').doc(book.id);
          docRef.update({
            priority: values.priority,
          });
        }}
      >
        <Form>
          <div>
            <Field
              component={TextField}
              name="title"
              type="string"
              label="書名"
            />
          </div>
          <div>著者：{book.authors.join(', ')}</div>
          <div>
            <Field
              component={TextField}
              name="priority"
              type="number"
              label="優先度"
            />
          </div>
          <Button variant="contained" color="primary" type="submit">
            更新
          </Button>
        </Form>
      </Formik>
    </React.Fragment>
  );
};

export { BookDetail };
