import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Close from '@material-ui/icons/Close';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db, firebase } from '../../Firebase';
import { BookForm } from './BookForm';
import { bookFormSchema, BookFormType } from './schema';

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

  const handleSubmit = async (values: BookFormType) => {
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

  const emptyBook: BookFormType = {
    title: '',
    authors: [''],
    read: false,
    owned: false,
    priority: 50,
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpenClick}
      >
        追加
      </Button>

      <Dialog open={open}>
        <DialogTitle>追加</DialogTitle>
        <DialogContent>
          <BookForm onSubmit={handleSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCloseClick} color="primary">
            キャンセル
          </Button>
          {/* <Button
            onClick={() => {
              props.handleSubmit();
            }}
            color="primary"
          >
            追加
          </Button> */}
        </DialogActions>
      </Dialog>
    </div>
  );
};
