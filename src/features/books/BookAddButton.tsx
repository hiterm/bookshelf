import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCreateBookMutation } from '../../generated/graphql';
import { useBookForm } from './BookForm';
import { IBookForm } from './schema';

export const BookAddButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDialogOpenClick = () => {
    setOpen(true);
  };

  const handleDialogCloseClick = () => {
    setOpen(false);
  };

  const [_createBookResult, createBook] = useCreateBookMutation();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const history = useHistory();

  const submitBook = async (value: IBookForm) => {
    const { authors, ...rest } = value;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    const result = await createBook({ bookData });

    if (result.data == null) {
      enqueueSnackbar(
        `Some thing is wrong. error: ${JSON.stringify(result.error)}`,
        {
          variant: 'error',
        }
      );
      return;
    }
    const data = result.data;

    const action = (key: SnackbarKey) => (
      <React.Fragment>
        <Button
          onClick={() => {
            history.push(`/books/${data.createBook.id}`);
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

    const message = `${value.title}を追加しました`;
    enqueueSnackbar(message, {
      variant: 'success',
      action,
    });
  };

  const emptyBook: IBookForm = {
    title: '',
    authors: [],
    isbn: '',
    read: false,
    owned: false,
    priority: 50,
    format: 'UNKNOWN',
    store: 'UNKNOWN',
  };

  const { form, submitForm } = useBookForm({
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
        <DialogContent>{form}</DialogContent>
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
