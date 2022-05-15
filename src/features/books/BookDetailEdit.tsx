import { Box, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { firebase, db } from '../../Firebase';
import { useBookForm } from './BookForm';
import { Book, BookBaseType } from './schema';

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const handleSubmit = async (values: BookBaseType) => {
    const docRef = db.collection('books').doc(book.id);
    await docRef.update({
      ...values,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    history.push(`/books/${book.id}`);
    enqueueSnackbar('更新しました', { variant: 'success' });
  };

  // id等は更新したくない
  const { id, createdAt, updatedAt, ...bookBase } = book;

  // const { renderForm, submitForm } = useBookForm({
  //   onSubmit: handleSubmit,
  //   initialValues: bookBase,
  // });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper
        sx={{
          padding: 5,
          width: {
            xs: 1,
            sm: 600,
          },
        }}
      >
        {/* TODO */}
        TODO
        {/* {renderForm()} */}
        {/* <Button variant="contained" color="primary" onClick={submitForm}> */}
        {/*   更新 */}
        {/* </Button> */}
      </Paper>
    </Box>
  );
};
