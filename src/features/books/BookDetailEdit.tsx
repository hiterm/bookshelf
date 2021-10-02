import Button from '@material-ui/core/Button';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { firebase, db } from '../../Firebase';
import {
  BookFormType,
  fromBookBaseToBookForm,
  fromBookFormToBookBase,
  useBookForm,
} from './BookForm';
import { Book } from './schema';

const removeUndefinedFromObject = (object: Object) => {
  return Object.fromEntries(
    Object.entries(object).filter(([_k, v]) => v !== undefined)
  );
};

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const handleSubmit = async (bookForm: BookFormType) => {
    const bookBase = fromBookFormToBookBase(bookForm);

    const docRef = db.collection('books').doc(book.id);
    await docRef.update({
      ...removeUndefinedFromObject(bookBase),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    history.push(`/books/${book.id}`);
    enqueueSnackbar('更新しました', { variant: 'success' });
  };

  // id等は更新したくない
  const { id, createdAt, updatedAt, ...dbBook } = book;
  const bookFormObj = fromBookBaseToBookForm(dbBook);

  const { renderForm, submitForm } = useBookForm({
    onSubmit: handleSubmit,
    initialValues: bookFormObj,
  });

  return (
    <React.Fragment>
      {renderForm()}
      <Button variant="contained" color="primary" onClick={submitForm}>
        更新
      </Button>
    </React.Fragment>
  );
};
