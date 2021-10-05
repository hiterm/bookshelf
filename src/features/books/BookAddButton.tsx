import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db, firebase } from '../../Firebase';
import { useBookForm } from './BookForm';
import { BookBaseType } from './schema';

export const BookAddButton: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const history = useHistory();

  const submitBook = async (values: BookBaseType) => {
    const doc = await db.collection('books').add({
      ...values,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const action = (key: string) => (
      <React.Fragment>
        <Button
          onClick={() => {
            history.push(`/books/${doc.id}`);
            closeSnackbar(key);
          }}
        >
          Move
        </Button>
        <Button
          onClick={() => {
            closeSnackbar(key);
          }}
        >
          <Close />
        </Button>
      </React.Fragment>
    );

    setOpen(false);

    const message = `${values.title}を追加しました`;
    enqueueSnackbar(message, {
      variant: 'success',
      action,
    });
  };

  const emptyBook: BookBaseType = {
    title: '',
    authors: [''],
    read: false,
    owned: false,
    priority: 50,
  };

  const { renderForm, submitForm } = useBookForm({
    onSubmit: submitBook,
    initialValues: emptyBook,
  });

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpenClick}
      >
        追加
      </Button>

      <Dialog open={open} fullWidth maxWidth="sm">
        <DialogTitle>追加</DialogTitle>
        <DialogContent>{renderForm()}</DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCloseClick} color="primary">
            キャンセル
          </Button>
          <Button onClick={submitForm} color="primary">
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
