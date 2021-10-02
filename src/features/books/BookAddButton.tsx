import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Close from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db, firebase } from '../../Firebase';
import { BookForm, BookFormType } from './BookForm';
import { BookBaseType } from './schema';

const removeUndefinedFromObject = (object: Object) => {
  return Object.fromEntries(
    Object.entries(object).filter(([_k, v]) => v !== undefined)
  );
};

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
    const { authors, ...rest } = values;
    const authorNames: string[] = authors.map(({ name }) => name);
    const bookBase: BookBaseType = {
      authors: authorNames,
      ...rest,
    };
    console.log(JSON.stringify(bookBase));
    const doc = await db.collection('books').add({
      ...removeUndefinedFromObject(bookBase),
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
    authors: [{ name: '' }],
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
