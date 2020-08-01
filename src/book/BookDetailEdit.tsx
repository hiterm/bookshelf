import Button from '@material-ui/core/Button';
import firebase from 'firebase';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { db } from '../Firebase';
import { BookForm } from './BookForm';
import { Book, bookFormSchema, DbBook } from './schema';

export const BookDetailEdit: React.FC<{ book: Book | undefined }> = (props) => {
  const book = props.book;

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  const handleSubmit = async (values: DbBook) => {
    let docRef = db.collection('books').doc(book.id);
    await docRef.update({
      ...values,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    history.push(`/books/${book.id}`);
    enqueueSnackbar('更新しました', { variant: 'success' });
  };

  // id等は更新したくない
  const { id, createdAt, updatedAt, ...dbBook } = book;

  return (
    <React.Fragment>
      <Formik
        initialValues={dbBook}
        onSubmit={handleSubmit}
        validationSchema={bookFormSchema}
      >
        {(props) => (
          <React.Fragment>
            <BookForm {...props} />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => {
                props.handleSubmit();
              }}
            >
              更新
            </Button>
          </React.Fragment>
        )}
      </Formik>
    </React.Fragment>
  );
};
