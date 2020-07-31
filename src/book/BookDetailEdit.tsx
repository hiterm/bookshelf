import React from 'react';
import { db } from '../Firebase';
import firebase from 'firebase';
import { Book } from './schema';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom';
import { BookForm } from './BookForm';

export const BookDetailEdit: React.FC<{ book: Book | undefined }> = (props) => {
  const book = props.book;

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  if (book === undefined) {
    return <div>Loading or not found.</div>;
  }

  const handleSubmit = async (values: Book) => {
    let docRef = db.collection('books').doc(book.id);
    await docRef.update({
      ...values,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    history.push(`/books/${book.id}`);
    enqueueSnackbar('更新しました', { variant: 'success' });
  };

  return (
    <React.Fragment>
      <BookForm book={book} submitLabel="更新" onSubmit={handleSubmit} />
    </React.Fragment>
  );
};
