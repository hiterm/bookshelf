import { Box, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useUpdateBookMutation } from '../../generated/graphql';
import { useBookForm } from './BookForm';
import { Book, IBookForm } from './schema';

export const BookDetailEdit: React.FC<{ book: Book }> = (props) => {
  const book = props.book;

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [_createBookResult, updateBook] = useUpdateBookMutation();

  const handleSubmit = async (values: IBookForm) => {
    const { authors, ...rest } = values;
    const bookData = {
      ...rest,
      authorIds: authors.map((author) => author.id),
    };
    await updateBook({ bookData: { id: book.id, ...bookData } });
    history.push(`/books/${book.id}`);
    enqueueSnackbar('更新しました', { variant: 'success' });
  };

  const { form, submitForm } = useBookForm({
    onSubmit: handleSubmit,
    initialValues: book,
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={submitForm}>
        <Paper
          sx={{
            padding: 5,
            width: {
              xs: 1,
              sm: 600,
            },
          }}
        >
          {form}
          <Button variant="contained" color="primary">
            更新
          </Button>
        </Paper>
      </form>
    </Box>
  );
};
